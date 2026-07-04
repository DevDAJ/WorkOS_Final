import { prisma } from "$lib/server";
import { callAI } from "$lib/ai/client";
import { computeRoleMatch } from "$lib/scoring/skill-role-match";
import { QuestStatus } from "$generated/prisma/enums";
import type { CareerQuest, QuestTask, RoleSkillRequirement } from "$generated/prisma/client";

const SYSTEM_PROMPT = `You are a career development AI. Create a personalized learning plan for a user who wants to qualify for a new role.

For each missing skill, generate a concrete task:
- description: a specific, actionable learning task. Include a project idea, resource, or practice exercise. NOT just "Learn {skill}".
- skillName: the skill this task targets

Return ONLY a JSON array of objects: [{ description: string, skillName: string }]
Keep descriptions concise (1 sentence each), 3-5 tasks max.`;

export async function getOrCreateQuest(userId: string, roleId: string): Promise<CareerQuest & { tasks: QuestTask[] }> {
  const existing = await prisma.careerQuest.findFirst({
    where: { userId, roleId, status: QuestStatus.ACTIVE },
    include: { tasks: true },
  });
  if (existing) return existing;

  const role = await prisma.careerRole.findUnique({
    where: { id: roleId },
    include: { requirements: true },
  });
  if (!role) throw new Error("Role not found");

  const userSkills = await (prisma.skill.findMany({
    where: { userId },
    select: { name: true },
  }) as Promise<{ name: string }[]>);
  const userSkillNames = new Set(userSkills.map((s) => s.name.toLowerCase()));

  const missingRequirements = (role.requirements as RoleSkillRequirement[])
    .filter((r) => !r.isOptional && !userSkillNames.has(r.skillName.toLowerCase()))
    .slice(0, 5);

  const tasks = missingRequirements.map((r) => ({
    description: `Learn and demonstrate ${r.skillName}`,
    skillName: r.skillName,
    skillWeight: r.weight,
  }));

  return prisma.careerQuest.create({
    data: {
      userId,
      roleId,
      title: `Unlock Role: ${role.name}`,
      description: `Build the skills needed to become a ${role.name}`,
      tasks: { create: tasks },
    },
    include: { tasks: true },
  });
}

export async function upgradeQuestWithAI(questId: string, userId: string): Promise<CareerQuest & { tasks: QuestTask[] }> {
  const quest = await prisma.careerQuest.findFirst({
    where: { id: questId, userId },
    include: { tasks: true, role: { include: { requirements: true } } },
  });
  if (!quest || !quest.role) throw new Error("Quest not found");

  const userSkills = await (prisma.skill.findMany({
    where: { userId },
    select: { name: true },
  }) as Promise<{ name: string }[]>);
  const missingRequirements = (quest.role.requirements as RoleSkillRequirement[])
    .filter((r) => !r.isOptional && !userSkills.some((s) => s.name.toLowerCase() === r.skillName.toLowerCase()))
    .slice(0, 5);

  const workHistory = await prisma.workExperience.findMany({
    where: { userId },
    select: { role: true, company: true },
    orderBy: { startDate: "desc" },
    take: 2,
  });

  const userPrompt = [
    `USER:`,
    `- Skills: ${userSkills.map((s: any) => s.name).join(", ")}`,
    `- Experience: ${workHistory.map((w: any) => `${w.role} at ${w.company}`).join(", ")}`,
    ``,
    `TARGET ROLE: ${quest.role.name}`,
    `Description: ${quest.role.description || "N/A"}`,
    ``,
    `Missing skills to develop:`,
    ...missingRequirements.map((r: any) => `- ${r.skillName} (weight: ${r.weight})`),
  ].join("\n");

  const aiResult = await callAI(SYSTEM_PROMPT, userPrompt);
  if (!aiResult) throw new Error("AI failed to generate tasks");

  let aiTasks: { description: string; skillName: string }[];
  try {
    const parsed = JSON.parse(aiResult);
    if (!Array.isArray(parsed)) throw new Error("AI returned non-array");
    aiTasks = parsed
      .map((t: any) => ({ description: t.description || "", skillName: t.skillName || "" }))
      .filter((t) => t.description && t.skillName)
      .slice(0, 5);
    if (aiTasks.length === 0) throw new Error("AI returned empty tasks");
  } catch {
    return quest;
  }

  // Delete old tasks and create new ones
  await prisma.questTask.deleteMany({ where: { questId } });
  return prisma.careerQuest.update({
    where: { id: questId },
    data: {
      tasks: {
        create: aiTasks.map((t) => {
          const req = missingRequirements.find((r) => r.skillName.toLowerCase() === t.skillName.toLowerCase());
          return { description: t.description, skillName: req?.skillName || t.skillName, skillWeight: req?.weight || 1 };
        }),
      },
    },
    include: { tasks: true },
  });
}

export async function completeTask(questId: string, taskId: string, userId: string): Promise<void> {
  const quest = await prisma.careerQuest.findFirst({ where: { id: questId, userId } });
  if (!quest) throw new Error("Quest not found");

  await prisma.questTask.update({
    where: { id: taskId },
    data: { status: "COMPLETED" as const, completedAt: new Date() },
  });

  const tasks: { status: string }[] = await (prisma.questTask.findMany({ where: { questId } }) as Promise<{ status: string }[]>);
  const completed = tasks.filter((t) => t.status === "COMPLETED").length;
  const progress = tasks.length > 0 ? Math.round((completed / tasks.length) * 100) : 0;

  await prisma.careerQuest.update({ where: { id: questId }, data: { progress } });

  if (progress === 100) {
    await prisma.careerQuest.update({
      where: { id: questId },
      data: { status: QuestStatus.COMPLETED, rewardScore: 10 },
    });
    const result = await computeRoleMatch(userId, quest.roleId);
    await prisma.careerMatch.upsert({
      where: { userId_roleId: { userId, roleId: quest.roleId } },
      update: {
        matchScore: result.score,
        strengths: result.strengths.map((s) => s.skill),
        gaps: result.gaps.map((g) => g.skill),
        breakdown: JSON.stringify(result.breakdown),
      },
      create: {
        userId,
        roleId: quest.roleId,
        matchScore: result.score,
        strengths: result.strengths.map((s) => s.skill),
        gaps: result.gaps.map((g) => g.skill),
        partialMatches: [],
        breakdown: JSON.stringify(result.breakdown),
      },
    });
  }
}

export async function getUserQuests(userId: string) {
  return prisma.careerQuest.findMany({
    where: { userId },
    include: { tasks: true, role: true },
    orderBy: { updatedAt: "desc" },
  });
}