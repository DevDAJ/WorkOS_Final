<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import * as Card from "$lib/components/ui/card";
  import { Badge } from "$lib/components/ui/badge";
  import { seniorityRank } from "$lib/graph/layout";
  import type { CareerGraph } from "$lib/graph/career-graph";

  let { data } = $props();
  let { previousRoleNames } = $state(data);
  let graph = $state<CareerGraph | null>(data.graph?.nodes?.length ? data.graph as any : null);
  let aiError = $state(false);
  let aiReasoning = $state<string | null>(null);
  let creatingQuest = $state(false);
  let loading = $state(!graph);
  let regenerating = $state(false);

  $effect(() => {
    if (data.graph?.nodes?.length) return;
    loading = true;
    const ctrl = new AbortController();
    fetch("/api/ai/career-map", { signal: ctrl.signal })
      .then((r) => r.json())
      .then((result) => {
        if (result.graph) {
          graph = result.graph;
          aiReasoning = result.reasoning || null;
        }
      })
      .catch(() => { aiError = true; })
      .finally(() => { loading = false; });
    return () => ctrl.abort();
  });

  const currentRole = graph?.nodes.find((n: any) => n.tier === "current");
  const currentRank = currentRole ? seniorityRank(currentRole.seniority) : -1;

  function matchesPrevious(name: string): boolean {
    const n = name.toLowerCase().replace(/^(intern|fresh\s*grad|junior|mid|senior|staff|principal)\s+/, "");
    return (previousRoleNames as string[]).some((pr) => {
      const p = pr.toLowerCase();
      return n === p || n.includes(p) || p.includes(n);
    });
  }

  let seniorityRows = $derived.by(() => {
    if (!graph) return [];
    const byRank = new Map<number, any[]>();
    for (const n of graph.nodes) {
      const r = seniorityRank(n.seniority);
      if (r < 0) continue;
      if (!byRank.has(r)) byRank.set(r, []);
      byRank.get(r)!.push(n);
    }
    const sorted = Array.from(byRank.entries()).sort((a: any, b: any) => a[0] - b[0]);
    return sorted.map(([rank, nodes]: [number, any[]]) => {
      const filtered = currentRank >= 0 && rank < currentRank
        ? nodes.filter((n: any) => matchesPrevious(n.name))
        : nodes;
      if (filtered.length === 0) return null;
      return { rank, label: filtered[0].seniority, nodes: filtered };
    }).filter((r): r is NonNullable<typeof r> => r !== null);
  });

  async function handleRegenerate() {
    regenerating = true;
    loading = true;
    aiError = false;
    aiReasoning = null;
    try {
      const res = await fetch("/api/ai/career-map?refresh=true");
      const result = await res.json();
      if (result.graph) {
        graph = result.graph;
        aiReasoning = result.reasoning || null;
      }
    } catch {
      aiError = true;
    } finally {
      regenerating = false;
      loading = false;
    }
  }

  async function handlePathToUnlock(node: any) {
    if (!node.quest) return;
    creatingQuest = true;
    try {
      await fetch("/api/career-quest/save-active", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: {
            name: node.name,
            category: node.category,
            seniority: node.seniority,
            description: node.description,
          },
          quest: node.quest,
        }),
      });
      window.location.href = "/career-quest";
    } catch {
      creatingQuest = false;
    }
  }

  const SENIORITY_LABELS: Record<string, string> = {
    intern: "Intern", freshgrad: "Fresh Grad",
    junior: "Junior", mid: "Mid", senior: "Senior",
    lead: "Lead", staff: "Staff", principal: "Principal",
  };

  const TIER_LABELS: Record<string, string> = {
    current: "Current", jump: "Jump", next: "Next", stretch: "Stretch", "long-term": "Long Term",
  };

  const RING_RADIUS = 13;
  const RING_CIRC = 2 * Math.PI * RING_RADIUS;

  function scoreColor(score: number): string {
    if (score >= 60) return "text-success stroke-success";
    if (score >= 40) return "text-warning stroke-warning";
    return "text-danger stroke-danger";
  }

  function scoreBg(score: number): string {
    if (score >= 60) return "bg-success";
    if (score >= 40) return "bg-warning";
    return "bg-danger";
  }

  function tierBorder(node: any): string {
    if (node.tier === "current") return "ring-2 ring-tier-current";
    if (node.tier === "jump") return "ring-1 ring-tier-jump/40";
    if (node.tier === "next") return "ring-1 ring-tier-next/40";
    return "";
  }
</script>

<div class="mx-auto max-w-5xl px-4 py-8">
  <header class="mb-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-foreground sm:text-3xl">Career Map</h1>
        <p class="mt-1 text-sm text-muted-foreground">Your career progression tree</p>
      </div>
      <Button variant="outline" size="sm" disabled={regenerating} onclick={handleRegenerate}>
        {regenerating ? "Regenerating..." : "Regenerate"}
      </Button>
    </div>
    {#if aiError}
      <p class="mt-3 text-sm text-danger">Could not generate AI career map.</p>
    {:else if aiReasoning}
      <p class="mt-3 rounded-lg bg-brand/10 px-4 py-2 text-sm text-brand">{aiReasoning}</p>
    {/if}
  </header>

  <Card.Root>
    <Card.Content class="p-4 sm:p-6">
      {#if graph}
        <div class="space-y-1">
          {#each seniorityRows as row, i}
            <div class="flex flex-col gap-3 sm:flex-row sm:gap-4">
              <div class="shrink-0 pt-2 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground sm:w-20 sm:pt-3 sm:text-right">
                {SENIORITY_LABELS[row.label.toLowerCase()] || row.label}
              </div>
              <div class="flex flex-1 flex-col gap-3 sm:flex-row sm:flex-wrap">
                {#each row.nodes as node}
                  <div
                    class="relative flex-1 rounded-lg border bg-card p-3 min-w-0 sm:basis-[200px] {tierBorder(node)} {node.tier === 'current' ? 'node-glow' : ''}"
                  >
                    <div class="flex items-center gap-3">
                      <div class="flex-1 min-w-0">
                        <div class="truncate text-sm font-medium text-foreground">{node.name}</div>
                        <div class="mt-0.5 flex flex-wrap items-center gap-1">
                          <Badge variant="outline" size="xs" class="whitespace-normal max-w-28">{node.category}</Badge>
                          {#if node.tier === 'current'}
                            <Badge variant="outline" size="xs" class="bg-brand/10 text-brand border-brand/30">Current</Badge>
                          {:else if node.tier === 'jump'}
                            <Badge variant="outline" size="xs" class="bg-amber-500/10 text-amber-600 border-amber-500/30 dark:text-amber-400">Jump</Badge>
                          {:else if node.tier === 'next'}
                            <Badge variant="outline" size="xs" class="bg-success/10 text-success border-success/30">Next</Badge>
                          {:else if node.tier === 'stretch'}
                            <Badge variant="secondary" size="xs">Stretch</Badge>
                          {:else}
                            <Badge variant="secondary" size="xs">Long Term</Badge>
                          {/if}
                        </div>
                      </div>
                      {#if node.matchScore !== undefined && node.tier !== 'current'}
                        <div class="relative size-9 shrink-0 sm:size-10">
                          <svg viewBox="0 0 32 32" class="size-9 -rotate-90 sm:size-10">
                            <circle cx="16" cy="16" r={RING_RADIUS} fill="none" stroke-width="3" class="stroke-muted" opacity="0.15"/>
                            <circle cx="16" cy="16" r={RING_RADIUS} fill="none" stroke-width="3"
                              stroke-dasharray={RING_CIRC} stroke-dashoffset={RING_CIRC * (1 - node.matchScore / 100)}
                              stroke-linecap="round" class={scoreColor(node.matchScore)} style="transition: stroke-dashoffset 0.6s"/>
                          </svg>
                          <span class="absolute inset-0 flex items-center justify-center text-[9px] font-bold {scoreColor(node.matchScore).split(' ')[0]}">
                            {node.matchScore}
                          </span>
                        </div>
                      {/if}
                    </div>

                    <div class="mt-3 space-y-3 border-t border-border pt-3">
                      {#if node.description}
                        <p class="text-sm text-muted-foreground">{node.description}</p>
                      {/if}

                      {#if node.skillGaps?.length}
                        <div>
                          <p class="mb-1.5 text-xs font-semibold uppercase tracking-wider text-danger">Requirements</p>
                          <div class="flex flex-wrap gap-1.5">
                            {#each node.skillGaps as gap}
                              <Badge variant="secondary" size="xs" class="h-auto overflow-visible whitespace-normal break-words text-center max-w-32 bg-danger/10 text-danger border-danger/20">{gap}</Badge>
                            {/each}
                          </div>
                        </div>
                      {/if}

                      {#if node.matchScore !== undefined && node.tier !== 'current'}
                        <div>
                          <div class="mb-1 flex items-center justify-between text-sm">
                            <span class="text-muted-foreground">Match</span>
                            <span class="font-bold {scoreColor(node.matchScore).split(' ')[0]}">{node.matchScore}%</span>
                          </div>
                          <div class="h-1.5 w-full rounded-full bg-muted">
                            <div
                              class="h-1.5 rounded-full transition-all {scoreBg(node.matchScore)}"
                              style="width: {node.matchScore}%"
                            ></div>
                          </div>
                        </div>
                      {/if}

                      {#if node.tier !== 'current'}
                        <Button size="sm" class="w-full" disabled={creatingQuest} onclick={() => handlePathToUnlock(node)}>
                          {creatingQuest ? "Creating quest..." : "Path to unlock"}
                        </Button>
                      {/if}
                    </div>
                  </div>
                {/each}
              </div>
            </div>

            {#if i < seniorityRows.length - 1}
              <div class="flex flex-col gap-3 sm:flex-row sm:gap-4" aria-hidden="true">
                <div class="hidden shrink-0 sm:block sm:w-20"></div>
                <div class="flex flex-1 justify-center py-1">
                  <div class="tier-line h-8 sm:h-10"></div>
                </div>
              </div>
            {/if}
          {/each}
        </div>
      {:else}
        {#if loading}
          <div class="flex flex-col items-center justify-center py-16">
            <div class="size-8 animate-spin rounded-full border-2 border-brand border-t-transparent" role="status"></div>
            <p class="mt-4 text-sm text-muted-foreground">Generating your career map...</p>
          </div>
        {:else}
          <div class="space-y-1" aria-hidden="true">
            {#each ['Intern', 'Fresh Grad', 'Junior', 'Mid', 'Senior'] as tier, i}
              <div class="flex flex-col gap-3 sm:flex-row sm:gap-4">
                <div class="shrink-0 pt-2 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground sm:w-20 sm:pt-3 sm:text-right">
                  {tier}
                </div>
                <div class="flex flex-1 flex-col gap-3 sm:flex-row sm:flex-wrap">
                  {#each [0, 1] as _}
                    <div class="flex-1 min-w-0 rounded-lg border bg-card p-3 sm:basis-[200px]">
                      <div class="flex items-center gap-3">
                        <div class="flex-1 min-w-0 space-y-2">
                          <div class="skeleton-shimmer h-3.5 w-3/4 rounded"></div>
                          <div class="flex items-center gap-1.5">
                            <div class="skeleton-shimmer h-3.5 w-16 rounded-full"></div>
                            <div class="skeleton-shimmer h-2.5 w-8 rounded"></div>
                          </div>
                        </div>
                        <div class="skeleton-shimmer size-9 shrink-0 rounded-full sm:size-10"></div>
                      </div>
                    </div>
                  {/each}
                </div>
              </div>
              {#if i < 2}
                <div class="flex justify-center py-1" aria-hidden="true">
                  <div class="tier-line h-8 sm:h-10"></div>
                </div>
              {/if}
            {/each}
          </div>
        {/if}
      {/if}
    </Card.Content>
  </Card.Root>
</div>