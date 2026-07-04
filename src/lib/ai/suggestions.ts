import { prisma } from "$lib/server";
import { callAI } from "./client";
import type { CareerGraph } from "$lib/graph/career-graph";

export interface QuestSuggestion {
  roleId: string;
  roleName: string;
  title: string;
  description: string;
  tasks: { description: string; skillName: string }[];
  estimatedTime: string;
  matchScore: number;
}

const SYSTEM_PROMPT = `You are a career coach AI. Given a user's profile and available career roles, suggest the most relevant quests.

Return ONLY a JSON array of up to 3 objects, each with:
- roleId: string
- title: short motivating quest title (<60 chars)
- description: why this role is a good next step for THIS user (1-2 sentences)
- tasks: array of { description: string, skillName: string } (3-5 specific actionable tasks, include project ideas not just "Learn X")
- estimatedTime: string (e.g. "4-6 weeks")
- matchScore: number

No markdown, no extra text, just the JSON array.`;

export async function suggestQuests(userId: string, graph: CareerGraph): Promise<QuestSuggestion[]> {
  const [allMatches, existingQuests] = await Promise.all([
    prisma.careerMatch.findMany({ where: { userId } }),
    prisma.careerQuest.findMany({ where: { userId, status: "ACTIVE" } }),
  ]);

  const existingRoleIds = new Set(existingQuests.map((q: any) => q.roleId));
  const eligible = (allMatches as any[])
    .filter((m: any) => !existingRoleIds.has(m.roleId) && m.matchScore >= 40 && m.matchScore < 80)
    .sort((a: any, b: any) => b.matchScore - a.matchScore)
    .slice(0, 5);

  if (eligible.length === 0) return [];

  // Deterministic fallback
  const fallback = async (): Promise<QuestSuggestion[]> => {
    const suggestions: QuestSuggestion[] = [];
    for (const match of eligible.slice(0, 3)) {
      const role = graph.nodes.find((n) => n.id === match.roleId);
      if (!role) continue;
      const requirements = await prisma.roleSkillRequirement.findMany({ where: { roleId: match.roleId } });
      const userSkills = await prisma.skill.findMany({ where: { userId }, select: { name: true } });
      const userSkillNames = new Set(userSkills.map((s: any) => s.name.toLowerCase()));
      const missingSkills = (requirements as any[]).filter((r: any) => !userSkillNames.has(r.skillName.toLowerCase())).slice(0, 5);
      suggestions.push({
        roleId: match.roleId,
        roleName: role.name,
        title: `Unlock Role: ${role.name}`,
        description: `Build the skills needed to become a ${role.name}. ${missingSkills.length} skills to develop.`,
        tasks: missingSkills.map((s: any) => ({ description: `Learn and demonstrate ${s.skillName}`, skillName: s.skillName })),
        estimatedTime: `${missingSkills.length * 4} weeks`,
        matchScore: match.matchScore,
      });
    }
    return suggestions;
  };

  // Build AI prompt
  const currentRole = graph.nodes.find((n) => n.tier === "current");
  const userSkills = await prisma.skill.findMany({ where: { userId }, select: { name: true } });
  const workHistory = await prisma.workExperience.findMany({
    where: { userId },
    select: { role: true, company: true },
    orderBy: { startDate: "desc" },
    take: 3,
  });

  const userPrompt = [
    `USER PROFILE:`,
    `- Current role: ${currentRole?.name || "Unknown"}`,
    `- Skills: ${userSkills.map((s: any) => s.name).join(", ")}`,
    `- Experience: ${workHistory.map((w: any) => `${w.role} at ${w.company}`).join(", ")}`,
    ``,
    `AVAILABLE ROLES:`,
    ...eligible.slice(0, 5).map((m: any) => {
      const role = graph.nodes.find((n) => n.id === m.roleId);
      if (!role) return "";
      return `- ${role.name} (match score: ${m.matchScore}%)
  Description: ${role.description || "N/A"}
  Seniority: ${role.seniority}`;
    }),
  ].join("\n");

  const aiResult = await callAI(SYSTEM_PROMPT, userPrompt);
  if (!aiResult) return fallback();

  try {
    const parsed = JSON.parse(aiResult);
    if (!Array.isArray(parsed)) return fallback();
    return parsed
      .map((s: any) => ({
        roleId: s.roleId,
        roleName: graph.nodes.find((n) => n.id === s.roleId)?.name || s.roleId,
        title: s.title || "",
        description: s.description || "",
        tasks: (s.tasks || []).slice(0, 5).map((t: any) => ({
          description: t.description || "",
          skillName: t.skillName || "",
        })),
        estimatedTime: s.estimatedTime || "",
        matchScore: s.matchScore ?? 0,
      }))
      .filter((s: QuestSuggestion) => s.roleId && s.title)
      .slice(0, 3);
  } catch {
    return fallback();
  }
}
