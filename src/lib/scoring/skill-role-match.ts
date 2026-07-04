import { prisma } from "$lib/server";

export interface SkillMatchResult {
  score: number;
  breakdown: {
    skillOverlap: { weight: number; score: number; details: { skillName: string; weight: number; userScore: number; evidenceCount: number }[] };
    evidenceStrength: { weight: number; score: number; details: { skillName: string; confirmed: number; unconfirmed: number; evidenceSource: string }[] };
    recency: { weight: number; score: number; details: { skillName: string; lastUsed: string | null }[] };
    projectDepth: { weight: number; score: number; details: { skillName: string; projectCount: number; avgTeamSize: number }[] };
  };
  strengths: { skill: string; evidence: string[] }[];
  gaps: { skill: string; suggestedProjects: string[] }[];
}

export async function computeRoleMatch(userId: string, roleId: string): Promise<SkillMatchResult> {
  const [requirements, userSkills, userProjects, userExperience] = await Promise.all([
    prisma.roleSkillRequirement.findMany({ where: { roleId } }),
    prisma.skill.findMany({
      where: { userId },
      include: { evidence: true },
    }),
    prisma.project.findMany({ where: { userId }, orderBy: { createdAt: "desc" } }),
    prisma.workExperience.findMany({ where: { userId }, orderBy: { startDate: "desc" } }),
  ]);

  const userSkillMap = new Map(userSkills.map((s: any) => [s.name.toLowerCase(), s]));
  const projectTechSet = new Set(userProjects.flatMap((p: any) => p.technologies));
  const projectSkillSet = new Set(userProjects.flatMap((p: any) => p.skillsDemonstrated));

  const skillOverlapDetails: SkillMatchResult["breakdown"]["skillOverlap"]["details"] = [];
  const evidenceDetails: SkillMatchResult["breakdown"]["evidenceStrength"]["details"] = [];
  const recencyDetails: SkillMatchResult["breakdown"]["recency"]["details"] = [];
  const projectDepthDetails: SkillMatchResult["breakdown"]["projectDepth"]["details"] = [];

  const strengths: SkillMatchResult["strengths"] = [];
  const gaps: SkillMatchResult["gaps"] = [];

  let overlapWeightSum = 0;
  let overlapScoreSum = 0;

  for (const req of requirements) {
    const skillName = req.skillName.toLowerCase();
    const userSkill = userSkillMap.get(skillName);
    const inProject = projectTechSet.has(skillName) || projectSkillSet.has(skillName);

    let userScore = 0;
    let evidenceCount = 0;
    let confirmed = 0;
    let unconfirmed = 0;
    let lastUsed: string | null = null;

    if (userSkill) {
      evidenceCount = (userSkill as any).evidence.length;
      confirmed = (userSkill as any).evidence.filter((e: any) => e.confirmed).length;
      unconfirmed = evidenceCount - confirmed;

      const expYear = (userSkill as any).yearsOfExperience ?? 0;
      const confScore = (userSkill as any).confidenceScore ?? 0.5;
      userScore = Math.min(1, (expYear / Math.max(1, req.minYears ?? 1)) * 0.6 + confScore * 0.4);

      const expMatch = userExperience.find((e: any) =>
        (e as any).bulletPoints.some((bp: string) => bp.toLowerCase().includes(skillName))
      );
      if (expMatch) lastUsed = (expMatch as any).startDate.toISOString();
    }

    if (inProject && !userSkill) {
      userScore = 0.3;
      evidenceCount = 1;
    }

    const overlapScore = userScore * req.weight;
    overlapWeightSum += req.weight;
    overlapScoreSum += overlapScore;

    skillOverlapDetails.push({
      skillName: req.skillName,
      weight: req.weight,
      userScore: Math.round(userScore * 100),
      evidenceCount,
    });

    evidenceDetails.push({
      skillName: req.skillName,
      confirmed,
      unconfirmed,
      evidenceSource: userSkill ? "skill evidence" : inProject ? "project" : "none",
    });

    recencyDetails.push({
      skillName: req.skillName,
      lastUsed,
    });

    const relatedProjects = userProjects.filter(
      (p: any) =>
        (p as any).technologies.some((t: string) => t.toLowerCase() === skillName) ||
        (p as any).skillsDemonstrated.some((s: string) => s.toLowerCase() === skillName)
    );
    projectDepthDetails.push({
      skillName: req.skillName,
      projectCount: relatedProjects.length,
      avgTeamSize: relatedProjects.length
        ? Math.round(relatedProjects.reduce((sum: number, p: any) => sum + ((p as any).teamSize ?? 1), 0) / relatedProjects.length)
        : 0,
    });

    if (userScore >= 0.6) {
      const evidence: string[] = [];
      if (userSkill) {
        for (const ev of (userSkill as any).evidence) {
          evidence.push(`${ev.source}:${ev.sourceId}`);
        }
      }
      if (relatedProjects.length) {
        evidence.push(...relatedProjects.map((p: any) => `project:${p.id}`));
      }
      strengths.push({ skill: req.skillName, evidence });
    } else {
      gaps.push({ skill: req.skillName, suggestedProjects: [] });
    }
  }

  const skillOverlapScore = overlapWeightSum > 0 ? overlapScoreSum / overlapWeightSum : 0;
  const evidenceScore = evidenceDetails.length > 0
    ? evidenceDetails.reduce((sum: number, d) => sum + (d.confirmed / Math.max(1, d.confirmed + d.unconfirmed)), 0) / evidenceDetails.length
    : 0;
  const recencyScore = recencyDetails.length > 0
    ? recencyDetails.reduce((sum: number) => sum + 0.5, 0) / recencyDetails.length
    : 0;
  const projectDepthScore = projectDepthDetails.length > 0
    ? projectDepthDetails.reduce((sum: number, d) => sum + Math.min(1, d.projectCount / 3), 0) / projectDepthDetails.length
    : 0;

  const totalScore = Math.round(
    (skillOverlapScore * 0.45 + evidenceScore * 0.25 + recencyScore * 0.1 + projectDepthScore * 0.2) * 100
  );

  return {
    score: totalScore,
    breakdown: {
      skillOverlap: { weight: 45, score: Math.round(skillOverlapScore * 100), details: skillOverlapDetails },
      evidenceStrength: { weight: 25, score: Math.round(evidenceScore * 100), details: evidenceDetails },
      recency: { weight: 10, score: Math.round(recencyScore * 100), details: recencyDetails },
      projectDepth: { weight: 20, score: Math.round(projectDepthScore * 100), details: projectDepthDetails },
    },
    strengths,
    gaps,
  };
}
