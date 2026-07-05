export const TIER_ORDER = ["current", "jump", "next", "stretch", "long-term"];

const SENIORITY_RANK: Record<string, number> = {
  intern: 0,
  freshgrad: 1,
  junior: 2,
  mid: 3,
  senior: 4,
  lead: 5,
  staff: 6,
  principal: 7,
};

export function seniorityRank(s: string): number {
  return SENIORITY_RANK[s.toLowerCase()] ?? -1;
}
