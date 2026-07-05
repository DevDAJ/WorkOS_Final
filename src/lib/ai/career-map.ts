import { prisma } from "$lib/server";
import { callAI } from "./client";
import type { CareerGraph, RoleNode, RoleEdge } from "$lib/graph/career-graph";
import { seniorityRank } from "$lib/graph/layout";

function inferJobTitle(skills: any[], education: any[]): string {
  if (skills.length > 0) {
    const counts: Record<string, number> = {};
    for (const s of skills) {
      const cat = (s.category || "OTHER").toLowerCase();
      counts[cat] = (counts[cat] || 0) + 1;
    }
    const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0];
    const roleMap: Record<string, string> = {
      frontend: "Frontend Developer",
      backend: "Backend Developer",
      fullstack: "Fullstack Developer",
      devops: "DevOps Engineer",
      data: "Data Analyst",
      ml: "Machine Learning Engineer",
      mobile: "Mobile Developer",
      design: "Designer",
      pm: "Product Manager",
      qa: "QA Engineer",
      sre: "SRE Engineer",
      security: "Security Engineer",
    };
    if (top && roleMap[top]) return roleMap[top];
  }
  if (education.length > 0) {
    const field = ((education[0] as any).field || "").toLowerCase();
    if (field.includes("computer") || field.includes("software") || field.includes("engineering"))
      return "Software Developer";
    if (field.includes("design")) return "Designer";
    if (field.includes("business") || field.includes("finance")) return "Analyst";
    if (field.includes("data") || field.includes("math")) return "Data Analyst";
  }
  return "Software Developer";
}

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
   Their actual current job title (exact match from work history) — this MUST have tier "current" and matchScore 95-100
   Lateral moves in related fields (e.g. Frontend Engineer → UI/UX Designer) — these have tier "jump"

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
- The user's actual current job (from "Current job" in profile) goes in "current" tier with matchScore 95-100
- There MUST be exactly ONE role with tier "current". Other roles at the same seniority get tier "jump".
- Seniority levels: INTERN (student), FRESHGRAD (no professional exp or <1 year), JUNIOR (1-3 years exp), MID (3-5 years), SENIOR (5+ years), STAFF, PRINCIPAL. Choose accurately based on work history.
- The quest for a current-tier role should focus on growth/deepening, NOT on "qualifying" for the role
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
      "seniority": "INTERN|FRESHGRAD|JUNIOR|MID|SENIOR|STAFF|PRINCIPAL",
      "description": "1-2 sentence description of the role",
      "matchScore": 75,
      "skillGaps": ["skill1", "skill2"],
      "tier": "current|jump|next",
      "quest": {
        "title": "Short motivating title",
        "description": "How to grow in this role (current), a lateral move worth exploring (jump), or why it's a good next step (next)",
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

export async function generateAICareerMap(userId: string, force?: boolean): Promise<{ graph: CareerGraph; reasoning: string | null }> {
  if (!force) {
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

  let currentJobTitle = currentJob?.role || personalInfo?.title;
  if (!currentJobTitle && (skills.length || education.length)) {
    currentJobTitle = inferJobTitle(skills, education);
  }

  const userPrompt = [
    `USER PROFILE:`,
    `Current job: ${currentJobTitle || "Unknown"}`,
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

  if (currentJobTitle) {
    const cjt = currentJobTitle.toLowerCase();
    const existing = nodes.find((n) => n.name.toLowerCase() === cjt)
      || nodes.find((n) => cjt.includes(n.name.toLowerCase()) && n.name.toLowerCase() !== cjt)
      || nodes.find((n) => n.name.toLowerCase().includes(cjt));
    if (existing) {
      existing.tier = "current";
      existing.matchScore = undefined;
      const currentRank = seniorityRank(existing.seniority);
      for (const n of nodes) {
        if (n !== existing && n.tier === "current") {
          n.tier = seniorityRank(n.seniority) > currentRank ? "next" : "jump";
        }
      }
    } else {
      const ref = nodes.find((n) => n.tier !== "current" && n.tier !== "next") || nodes[0];
      const fallbackSeniority = ref?.seniority || "FRESHGRAD";
      const currentRank = seniorityRank(fallbackSeniority);
      for (const n of nodes) {
        if (n.tier === "current") {
          n.tier = seniorityRank(n.seniority) > currentRank ? "next" : "jump";
        }
      }
      nodes.unshift({
        id: crypto.randomUUID(),
        name: currentJobTitle,
        category: ref?.category || "OTHER",
        seniority: fallbackSeniority,
        description: "Current role",
        tier: "current",
        skillGaps: [],
      });
    }
  }

  const totalYears = workHistory.reduce((sum: number, w: any) => {
    if (!w.startDate) return sum;
    const end = w.endDate ? new Date(w.endDate) : new Date();
    return sum + (end.getTime() - new Date(w.startDate).getTime()) / (365.25 * 24 * 60 * 60 * 1000);
  }, 0);
  if (totalYears < 1) {
    for (const n of nodes) {
      if (n.tier === "current" && n.seniority.toUpperCase() === "JUNIOR") {
        n.seniority = "FRESHGRAD";
      }
    }
  }

  const current = nodes.find((n) => n.tier === "current");
  if (current) {
    const cRank = seniorityRank(current.seniority);
    for (const n of nodes) {
      if (n !== current && n.tier === "jump" && seniorityRank(n.seniority) > cRank) {
        n.tier = "next";
      }
    }
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
