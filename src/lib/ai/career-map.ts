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
  currentRoleName: string;
  nodes: { roleName: string; tier: RoleNode["tier"] }[];
  edges: { fromRoleName: string; toRoleName: string; category: string }[];
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

Available roles are listed by name. Use the EXACT role names from the list — do not modify or abbreviate them.

Return ONLY JSON:
{
  "currentRoleName": "exact name of the role closest to user's current job",
  "nodes": [{ "roleName": "exact role name", "tier": "next"|"stretch"|"long-term" }],
  "edges": [{ "fromRoleName": "exact role name", "toRoleName": "exact role name", "category": "NEXT"|"STRETCH"|"LONG_TERM" }],
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
    (r) => `- Name: ${r.name}\n  Category: ${r.category}\n  Seniority: ${r.seniority}\n  Description: ${r.description || "N/A"}`,
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
  if (!parsed.currentRoleName || !Array.isArray(parsed.nodes) || !Array.isArray(parsed.edges)) {
    throw new Error("AI response missing required fields");
  }

  // Resolve role names to IDs (case-insensitive)
  const nameMap = new Map<string, (typeof roles)[0]>();
  for (const r of roles) {
    nameMap.set(r.name.toLowerCase(), r);
  }

  const resolve = (name: string) => nameMap.get(name.toLowerCase());

  // Filter to known roles, resolve to IDs
  const currentRoleRaw = resolve(parsed.currentRoleName);
  if (!currentRoleRaw) throw new Error(`AI referenced unknown role: ${parsed.currentRoleName}`);

  const validNodes = parsed.nodes.filter((n) => resolve(n.roleName));
  const validNodeNames = new Set([currentRoleRaw.name.toLowerCase(), ...validNodes.map((n) => n.roleName.toLowerCase())]);
  const validEdges = parsed.edges.filter(
    (e) => validNodeNames.has(e.fromRoleName.toLowerCase()) && validNodeNames.has(e.toRoleName.toLowerCase())
  );

  // Build nodes with full role data
  const nodes: RoleNode[] = [];

  // Current role
  nodes.push({
    id: currentRoleRaw.id,
    name: currentRoleRaw.name,
    category: currentRoleRaw.category,
    seniority: currentRoleRaw.seniority,
    description: currentRoleRaw.description,
    tier: "current",
  });

  // Other tiers
  for (const n of validNodes) {
    const role = resolve(n.roleName)!;
    nodes.push({
      id: role.id,
      name: role.name,
      category: role.category,
      seniority: role.seniority,
      description: role.description,
      tier: n.tier,
    });
  }

  // Build edges
  const edgeSet = new Set<string>();
  const edges: RoleEdge[] = [];
  for (const e of validEdges) {
    const fromRole = resolve(e.fromRoleName)!;
    const toRole = resolve(e.toRoleName)!;
    const key = `${fromRole.id}-${toRole.id}`;
    if (edgeSet.has(key)) continue;
    edgeSet.add(key);
    edges.push({
      fromRoleId: fromRole.id,
      toRoleId: toRole.id,
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
