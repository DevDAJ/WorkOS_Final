import { prisma } from "$lib/server";
import type { CareerRole, CareerPathEdge, CareerMatch } from "$generated/prisma/client";

export interface RoleNode {
  id: string;
  name: string;
  category: string;
  seniority: string;
  description: string | null;
  matchScore?: number;
  tier: "current" | "next" | "stretch" | "long-term";
  skillGaps?: string[];
  quest?: {
    title: string;
    description: string;
    tasks: { description: string; skillName: string }[];
  };
}

export interface RoleEdge {
  fromRoleId: string;
  toRoleId: string;
  category: string;
  requiredSkillScore: number;
}

export interface CareerGraph {
  nodes: RoleNode[];
  edges: RoleEdge[];
}

export async function buildCareerGraph(userId: string, currentJobTitle?: string): Promise<CareerGraph> {
  const [roles, edges, matches, currentJob] = await Promise.all([
    prisma.careerRole.findMany({ orderBy: { seniority: "asc" } }) as Promise<CareerRole[]>,
    prisma.careerPathEdge.findMany() as Promise<CareerPathEdge[]>,
    prisma.careerMatch.findMany({ where: { userId } }) as Promise<CareerMatch[]>,
    !currentJobTitle
      ? prisma.workExperience.findFirst({ where: { userId, current: true }, select: { role: true } })
      : undefined,
  ]);

  // Resolve current job title
  const jobTitle = currentJobTitle || currentJob?.role;

  // Fuzzy-match the user's actual current job title to a CareerRole
  let currentRoleId: string | null = null;
  if (jobTitle) {
    const matchName = jobTitle.toLowerCase().replace(/^(engineer|developer)\s*/i, "").trim();
    let best: CareerRole | null = null;
    let bestScore = 0;
    for (const r of roles) {
      const rn = r.name.toLowerCase().replace(/^(junior|mid|senior|staff|principal)\s+/, "").trim();
      let score = 0;
      if (rn === matchName) score = 10;
      else if (rn.includes(matchName) || matchName.includes(rn)) score = 5;
      else {
        const words = matchName.split(/\s+/).filter(Boolean);
        const rWords = rn.split(/\s+/).filter(Boolean);
        const overlap = words.filter((w: string) => rWords.includes(w)).length;
        score = overlap / Math.max(words.length, rWords.length);
      }
      if (score > bestScore) { bestScore = score; best = r; }
    }
    if (best && bestScore >= 0.3) currentRoleId = best.id;
  }

  const matchMap = new Map<string, number>();
  for (const m of matches) {
    matchMap.set(m.roleId, m.matchScore);
  }

  const edgeMap = new Map<string, CareerPathEdge>();
  for (const e of edges) {
    edgeMap.set(`${e.fromRoleId}-${e.toRoleId}`, e);
  }

  const bestMatch: CareerMatch | null = matches.length
    ? matches.reduce((a: CareerMatch, b: CareerMatch) => (a.matchScore > b.matchScore ? a : b))
    : null;

  const nodes: RoleNode[] = roles.map((r) => {
    let tier: RoleNode["tier"] = "long-term";
    const matchScore = matchMap.get(r.id) ?? -1;

    if (currentRoleId === r.id) {
      tier = "current";
    } else if (bestMatch && r.id === bestMatch.roleId && matchScore >= 60 && !currentRoleId) {
      tier = "current";
    } else {
      const anchorId = currentRoleId || bestMatch?.roleId;
      const isDirectEdge =
        anchorId &&
        (edgeMap.has(`${anchorId}-${r.id}`) ||
         Array.from(edgeMap.values()).some((e) => e.toRoleId === r.id && e.fromRoleId === anchorId));

      if (isDirectEdge) {
        const edge = edgeMap.get(`${anchorId!}-${r.id}`)
          ?? Array.from(edgeMap.values()).find((e) => e.toRoleId === r.id && e.fromRoleId === anchorId!);
        const ec = edge ? edge.category : "NEXT";
        tier = ec.toLowerCase() as RoleNode["tier"];
      } else if (matchScore >= 40) {
        tier = "stretch";
      }
    }

    return {
      id: r.id,
      name: r.name,
      category: r.category,
      seniority: r.seniority,
      description: r.description,
      matchScore: matchScore >= 0 ? matchScore : undefined,
      tier,
    };
  });

  return {
    nodes,
    edges: edges.map((e) => ({
      fromRoleId: e.fromRoleId,
      toRoleId: e.toRoleId,
      category: e.category,
      requiredSkillScore: e.requiredSkillScore,
    })),
  };
}

export function findPathFromUser(graph: CareerGraph, _userId: string, targetRoleId: string): RoleNode[] {
  const current = graph.nodes.find((n) => n.tier === "current");
  if (!current) return [];

  const visited = new Set<string>();
  const queue: { nodeId: string; path: RoleNode[] }[] = [{ nodeId: current.id, path: [current] }];

  while (queue.length) {
    const { nodeId, path } = queue.shift()!;
    if (nodeId === targetRoleId) return path;

    const neighbors = graph.edges
      .filter((e) => e.fromRoleId === nodeId)
      .map((e) => graph.nodes.find((n) => n.id === e.toRoleId))
      .filter((n: RoleNode | undefined): n is RoleNode => !!n && !visited.has(n.id));

    for (const n of neighbors) {
      visited.add(n.id);
      queue.push({ nodeId: n.id, path: [...path, n] });
    }
  }

  return [];
}