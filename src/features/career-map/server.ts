import { prisma } from "$lib/server";
import { buildCareerGraph } from "$lib/graph/career-graph";
import { computeRoleMatch } from "$lib/scoring/skill-role-match";
import { suggestQuests } from "$lib/ai/suggestions";
import { roles, edges } from "./seed";

export async function seedRoles(): Promise<void> {
  const existing = await prisma.careerRole.findFirst();
  if (existing) return; // already seeded

  for (const r of roles) {
    await prisma.careerRole.create({
      data: {
        name: r.name,
        category: r.category as any,
        seniority: r.seniority as any,
        description: r.description,
        requirements: {
          create: r.skills.map((s) => ({
            skillName: s.name,
            weight: s.weight,
            isOptional: s.isOptional,
            minYears: s.minYears,
          })),
        },
      },
    });
  }

  const roleMap = new Map<string, string>();
  const allRoles = await prisma.careerRole.findMany();
  for (const r of allRoles) roleMap.set(r.name, r.id);

  for (const e of edges) {
    const fromId = roleMap.get(e.fromRole);
    const toId = roleMap.get(e.toRole);
    if (fromId && toId) {
      await prisma.careerPathEdge.create({
        data: {
          fromRoleId: fromId,
          toRoleId: toId,
          category: e.category as any,
          requiredSkillScore: e.requiredSkillScore,
        },
      });
    }
  }
}

export async function getCareerMap(userId: string, currentJobTitle?: string) {
  const [previousRoles, graph] = await Promise.all([
    prisma.workExperience.findMany({
      where: { userId, current: false },
      select: { role: true },
    }),
    buildCareerGraph(userId, currentJobTitle),
  ]);

  const suggestions = await suggestQuests(userId, graph);
  return {
    graph,
    suggestions,
    previousRoleNames: [...new Set(previousRoles.map((r) => r.role))],
  };
}

export async function getRoleMatchDetail(userId: string, roleId: string) {
  const [role, result] = await Promise.all([
    prisma.careerRole.findUnique({
      where: { id: roleId },
      include: { requirements: true },
    }),
    computeRoleMatch(userId, roleId),
  ]);

  if (!role) return null;

  // upsert match result
  await prisma.careerMatch.upsert({
    where: { userId_roleId: { userId, roleId } },
    update: {
      matchScore: result.score,
      strengths: result.strengths.map((s: { skill: string; evidence: string[] }) => s.skill),
      gaps: result.gaps.map((g: { skill: string; suggestedProjects: string[] }) => g.skill),
      partialMatches: [],
      breakdown: JSON.stringify(result.breakdown),
    },
    create: {
      userId,
      roleId,
      matchScore: result.score,
      strengths: result.strengths.map((s: { skill: string; evidence: string[] }) => s.skill),
      gaps: result.gaps.map((g: { skill: string; suggestedProjects: string[] }) => g.skill),
      partialMatches: [],
      breakdown: JSON.stringify(result.breakdown),
    },
  });

  return { role, match: result };
}
