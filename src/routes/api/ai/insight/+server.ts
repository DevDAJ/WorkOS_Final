import { json } from "@sveltejs/kit";
import { prisma } from "$lib/server";
import { callAI } from "$lib/ai/client";
import type { RequestHandler } from "./$types";

const SYSTEM_PROMPT = `You are a career coach AI. Explain why a specific career role fits the user's current stage.

The tier means:
- "current": the user's current role
- "next": achievable with focused effort (1-6 months)
- "stretch": achievable with significant skill building (6-18 months)
- "long-term": aspirational (18+ months)

Write 1-2 sentences explaining why this role fits this tier for this specific user. Consider their skills, experience, and career trajectory. Be specific, not generic. Return ONLY a JSON object: { "insight": "..." }`;

export const GET: RequestHandler = async ({ locals, url }) => {
  if (!locals.user) return json({ error: "Unauthorized" }, { status: 401 });

  const roleId = url.searchParams.get("roleId");
  if (!roleId) return json({ error: "Missing roleId" }, { status: 400 });

  const [role, currentJob] = await Promise.all([
    prisma.careerRole.findUnique({ where: { id: roleId } }),
    prisma.workExperience.findFirst({ where: { userId: locals.user.id, current: true }, select: { role: true } }),
  ]);
  if (!role) return json({ error: "Role not found" }, { status: 404 });

  const match = await prisma.careerMatch.findUnique({
    where: { userId_roleId: { userId: locals.user.id, roleId } },
  });

  const tier = match && match.matchScore >= 60 ? "current"
    : match && match.matchScore >= 50 ? "next"
    : match && match.matchScore >= 40 ? "stretch"
    : "long-term";

  const userSkills = await prisma.skill.findMany({ where: { userId: locals.user.id }, select: { name: true } });

  const userPrompt = [
    `USER: currently a ${currentJob?.role || "Unknown"}`,
    `TARGET ROLE: ${role.name} (${tier})`,
    `MATCH SCORE: ${match?.matchScore ?? 0}%`,
    `USER SKILLS: ${userSkills.map((s: any) => s.name).join(", ")}`,
    `ROLE SKILLS: ${role.description || "N/A"}`,
  ].join("\n");

  const aiResult = await callAI(SYSTEM_PROMPT, userPrompt);
  if (!aiResult) return json({ insight: null });

  try {
    const parsed = JSON.parse(aiResult);
    return json({ insight: parsed.insight || null });
  } catch {
    return json({ insight: null });
  }
};
