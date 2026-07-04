import { prisma } from "$lib/server";
import { callAI } from "./client";
import type { CareerGraph, RoleNode, RoleEdge } from "$lib/graph/career-graph";

interface AIQuestTask {
  description: string;
  skillName: string;
}

interface AIQuest {
  title: string;
  description: string;
  tasks: AIQuestTask[];
}

interface AIRole {
  name: string;
  category: string;
  seniority: string;
  description: string;
  matchScore: number;
  skillGaps: string[];
  tier: "current" | "next";
  quest: AIQuest;
}

interface AIEdge {
  fromRole: string;
  toRole: string;
}

interface AICareerMapResponse {
  currentLevel: string;
  nextLevel: string;
  roles: AIRole[];
  edges: AIEdge[];
  reasoning: string;
}

const SYSTEM_PROMPT = `You are a career path architect AI. Design a personalized career progression map.

Based on the user's profile, determine their current seniority level from their work history. Then:

1. Generate roles at their current seniority level — include:
   Their actual current job title (exact match from work history)
   Lateral moves in related fields (e.g. Frontend Engineer → UI/UX Designer)

2. Generate roles at the NEXT seniority level (one step up from their current level)

3. For EVERY role, generate a concrete quest with:
   - A motivating title
   - A short description of why this role fits
   - 3-5 specific, actionable learning tasks (include project ideas, not just "Learn X")
   - Each task must target a specific skill

4. Define edges connecting current-tier roles to next-tier roles

RULES:
- Generate realistic, specific role names (e.g. "Senior Frontend Engineer", not "Role 1")
- Each role must have a unique name
- 2-4 roles per tier
- matchScore: 0-100 based on how well the user's skills overlap with this role
- skillGaps: specific skills the user needs to develop for this role

Return ONLY JSON:
{
  "currentLevel": "the user's current seniority level (e.g. senior, mid)",
  "nextLevel": "the next seniority level (e.g. lead, senior)",
  "roles": [
    {
      "name": "exact role name",
      "category": "FRONTEND|BACKEND|DEVOPS|FULLSTACK|DATA|ML|MOBILE|DESIGN|PM|QA|SRE|SECURITY|OTHER",
      "seniority": "JUNIOR|MID|SENIOR|STAFF|PRINCIPAL",
      "description": "1-2 sentence description of the role",
      "matchScore": 75,
      "skillGaps": ["skill1", "skill2"],
      "tier": "current|next",
      "quest": {
        "title": "Short motivating title",
        "description": "Why this role is a good next step",
        "tasks": [
          { "description": "Build a project that demonstrates X", "skillName": "X" }
        ]
      }
    }
  ],
  "edges": [
    { "fromRole": "exact current role name", "toRole": "exact next role name" }
  ],
  "reasoning": "2-3 sentence explanation of this career path"
}`;

export async function generateAICareerMap(userId: string): Promise<{ graph: CareerGraph; reasoning: string | null }> {
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

  const [workHistory, skills, projects, education, certifications, personalInfo] = await Promise.all([
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

  const currentJob = workHistory.find((w: any) => w.current);
  const allRoles = workHistory.map((w: any) => w.role).filter(Boolean);

  const userPrompt = [
    `USER PROFILE:`,
    `Current job: ${currentJob?.role || personalInfo?.title || "Unknown"}`,
    personalInfo?.summary ? `Summary: ${personalInfo.summary}` : null,
    ``,
    `ALL ROLES HELD:`,
    ...allRoles.map((r: string) => `- ${r}`),
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
  ].filter(Boolean).join("\n");

  const aiResult = await callAI(SYSTEM_PROMPT, userPrompt);
  if (!aiResult) throw new Error("AI failed to generate career map");

  let parsed: AICareerMapResponse;
  try {
    parsed = JSON.parse(aiResult);
  } catch {
    throw new Error("AI returned invalid JSON");
  }

  if (!Array.isArray(parsed.roles) || !Array.isArray(parsed.edges) || !parsed.currentLevel) {
    throw new Error("AI response missing required fields");
  }

  const roleNameMap = new Map<string, AIRole>();
  for (const r of parsed.roles) {
    roleNameMap.set(r.name, r);
  }

  const nodes: RoleNode[] = [];
  for (const r of parsed.roles) {
    const id = crypto.randomUUID();
    nodes.push({
      id,
      name: r.name,
      category: r.category,
      seniority: r.seniority,
      description: r.description,
      matchScore: r.matchScore,
      tier: r.tier,
      skillGaps: r.skillGaps,
      quest: r.quest,
    });
  }

  const nodeNameToId = new Map<string, string>();
  for (const n of nodes) {
    nodeNameToId.set(n.name, n.id);
  }

  const edgeSet = new Set<string>();
  const edges: RoleEdge[] = [];
  for (const e of parsed.edges) {
    const fromId = nodeNameToId.get(e.fromRole);
    const toId = nodeNameToId.get(e.toRole);
    if (!fromId || !toId) continue;
    const key = `${fromId}-${toId}`;
    if (edgeSet.has(key)) continue;
    edgeSet.add(key);
    edges.push({
      fromRoleId: fromId,
      toRoleId: toId,
      category: "NEXT",
      requiredSkillScore: 0,
    });
  }

  const graph: CareerGraph = { nodes, edges };
  const result = { graph, reasoning: parsed.reasoning || null };

  await prisma.user.update({
    where: { id: userId },
    data: { careerMapCache: JSON.parse(JSON.stringify(result)) },
  });

  return result;
}
