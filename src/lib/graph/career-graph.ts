export interface RoleNode {
  id: string;
  name: string;
  category: string;
  seniority: string;
  description: string | null;
  matchScore?: number;
  tier: "current" | "jump" | "next" | "stretch" | "long-term";
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

