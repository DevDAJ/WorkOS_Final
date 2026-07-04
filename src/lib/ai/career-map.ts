import { prisma } from "$lib/server";
import { callAI } from "./client";
import type { CareerGraph, RoleNode, RoleEdge } from "$lib/graph/career-graph";
import type { Prisma } from "$generated/prisma/client";

type CareerRoleRow = {
  id: string;
  name: string;
  category: string;
  seniority: string;
  description: string | null;
};

interface AICareerMapResponse {
  currentRoleId: string;
  nodes: { roleId: string; tier: RoleNode["tier"] }[];
  edges: { fromRoleId: string; toRoleId: string; category: string }[];
  reasoning: string;
}

const SYSTEM_PROMPT = `You are a career path architect AI. Design a personalized career progression map.

TIERS:
- "current": the user's current role (exactly 1)
- "next": achievable with focused effort (1-6 months)
- "stretch": requires significant skill building (6-18 months)
- "long-term": aspirational (18+ months)

RULES:
- Assign exactly 1 role as "current"
- Return ONLY the tier for "next", "stretch", and "long-term" roles in the nodes array
- Select 2-4 roles for "next", 2-4 for "stretch", 2-4 for "long-term"
- Exclude roles irrelevant to this user
- Define logical progression edges between roles
- A role appears in exactly one tier

Return ONLY JSON:
{
  "currentRoleId": "id of the role closest to user's current job",
  "nodes": [{ "roleId": "id", "tier": "next"|"stretch"|"long-term" }],
  "edges": [{ "fromRoleId": "id", "toRoleId": "id", "category": "NEXT"|"STRETCH"|"LONG_TERM" }],
  "reasoning": "2-3 sentence explanation of this path"
}`;

export async function generateAICareerMap(userId: string): Promise<{ graph: CareerGraph; reasoning: string | null }> {
  // Check cache
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { careerMapCache: true },
  });
  if (user?.careerMapCache) {
    const cached = typeof user.careerMapCache === "string"
      ? JSON.parse(user.careerMapCache)
      : user.careerMapCache;
    if (cached?.graph?.nodes?.length && cached?.graph?.edges) {
      return cached;
    }
  }

  // Fetch all data in parallel
  const [rolesRaw, workHistory, skills, projects, education, certifications, personalInfo] = await Promise.all([
    prisma.careerRole.findMany({ orderBy: { seniority: "asc" } }),
    prisma.workExperience.findMany({ where: { userId }, orderBy: { startDate: "desc" } }),
    prisma.skill.findMany({ where: { userId }, select: { name: true, category: true, yearsOfExperience: true } }),
    prisma.project.findMany({
      where: { userId },
      select: { title: true, description: true, technologies: true, skillsDemonstrated: true },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.education.findMany({ where: { userId }, orderBy: { startDate: "desc" }, take: 3 }),
    prisma.certification.findMany({ where: { userId }, take: 3 }),
    prisma.personalInfo.findUnique({ where: { userId } }),
  ]);
  const roles = rolesRaw as unknown as CareerRoleRow[];

  const roleDescriptions = roles.map(
    (r) => `- ID: ${r.id}\n  Name: ${r.name}\n  Category: ${r.category}\n  Seniority: ${r.seniority}\n  Description: ${r.description || "N/A"}`,
  ).join("\n");

  const currentJob = workHistory.find((w: any) => w.current);
  const userPrompt = [
    `USER PROFILE:`,
    `Current job: ${currentJob?.role || personalInfo?.title || "Unknown"}`,
    personalInfo?.summary ? `Summary: ${personalInfo.summary}` : null,
    ``,
    `WORK HISTORY:`,
    ...workHistory.map((w: any) => `- ${w.role} at ${w.company} (${w.current ? "Current" : `${w.startDate ? new Date(w.startDate).getFullYear() : ""} - ${w.endDate ? new Date(w.endDate).getFullYear() : ""}`})`),
    ``,
    `SKILLS:`,
    ...skills.map((s: any) => `- ${s.name}${s.yearsOfExperience ? ` (${s.yearsOfExperience}y)` : ""}`),
    ``,
    `PROJECTS:`,
    ...projects.map((p: any) => `- ${p.title}: ${(p.technologies as string[])?.join(", ") || ""}`),
    ``,
    education.length > 0 ? `EDUCATION:\n${(education as any[]).map((e: any) => `- ${e.degree} in ${e.field} at ${e.institution}`).join("\n")}\n` : "",
    certifications.length > 0 ? `CERTIFICATIONS:\n${(certifications as any[]).map((c: any) => `- ${c.name} (${c.issuer})`).join("\n")}\n` : "",
    ``,
    `AVAILABLE CAREER ROLES:`,
    roleDescriptions,
  ].filter(Boolean).join("\n");

  const aiResult = await callAI(SYSTEM_PROMPT, userPrompt);
  if (!aiResult) throw new Error("AI failed to generate career map");

  let parsed: AICareerMapResponse;
  try {
    parsed = JSON.parse(aiResult);
  } catch {
    throw new Error("AI returned invalid JSON");
  }

  // Validate
  if (!parsed.currentRoleId || !Array.isArray(parsed.nodes) || !Array.isArray(parsed.edges)) {
    throw new Error("AI response missing required fields");
  }

  const roleMap = new Map(roles.map((r) => [r.id, r]));
  const allNodeIds = new Set<string>([parsed.currentRoleId, ...parsed.nodes.map((n) => n.roleId)]);

  // Validate role IDs exist in DB
  for (const id of allNodeIds) {
    if (!roleMap.has(id)) throw new Error(`AI referenced unknown role: ${id}`);
  }

  // Build nodes with full role data
  const nodes: RoleNode[] = [];

  // Current role
  const currentRole = roleMap.get(parsed.currentRoleId)!;
  nodes.push({
    id: currentRole.id,
    name: currentRole.name,
    category: currentRole.category,
    seniority: currentRole.seniority,
    description: currentRole.description,
    tier: "current",
  });

  // Other tiers
  for (const n of parsed.nodes) {
    const role = roleMap.get(n.roleId)!;
    nodes.push({
      id: role.id,
      name: role.name,
      category: role.category,
      seniority: role.seniority,
      description: role.description,
      tier: n.tier,
    });
  }

  // Validate and build edges
  const edgeSet = new Set<string>();
  const edges: RoleEdge[] = [];
  for (const e of parsed.edges) {
    const key = `${e.fromRoleId}-${e.toRoleId}`;
    if (!allNodeIds.has(e.fromRoleId) || !allNodeIds.has(e.toRoleId)) continue;
    if (edgeSet.has(key)) continue;
    edgeSet.add(key);
    edges.push({
      fromRoleId: e.fromRoleId,
      toRoleId: e.toRoleId,
      category: e.category,
      requiredSkillScore: 0,
    });
  }

  const graph: CareerGraph = { nodes, edges };
  const result = { graph, reasoning: parsed.reasoning || null };

  // Cache
  await prisma.user.update({
    where: { id: userId },
    data: { careerMapCache: JSON.parse(JSON.stringify(result)) },
  });

  return result;
}
