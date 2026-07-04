export const TIER_ORDER = ["current", "next", "stretch", "long-term"];

const SENIORITY_RANK: Record<string, number> = {
  junior: 0,
  mid: 1,
  senior: 2,
  lead: 3,
  staff: 4,
  principal: 5,
};

export function seniorityRank(s: string): number {
  return SENIORITY_RANK[s.toLowerCase()] ?? -1;
}
