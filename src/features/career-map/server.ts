import { prisma } from "$lib/server";
import { computeRoleMatch } from "$lib/scoring/skill-role-match";

export async function getCareerMap(userId: string, _currentJobTitle?: string) {
  const previousRoles = await prisma.workExperience.findMany({
    where: { userId, current: false },
    select: { role: true },
  });

  return {
    graph: { nodes: [], edges: [] },
    suggestions: [],
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
