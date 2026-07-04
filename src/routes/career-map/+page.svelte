<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import * as Card from "$lib/components/ui/card";
  import { Badge } from "$lib/components/ui/badge";
  import { seniorityRank, TIER_ORDER } from "$lib/graph/layout";

  let { data } = $props();
  let { suggestions, previousRoleNames } = $state(data);
  let graph = $state<typeof data.graph | null>(null);
  let selectedRole = $state<typeof data.graph.nodes[0] | null>(null);
  let aiLoading = $state(true);
  let aiError = $state(false);
  let aiReasoning = $state<string | null>(null);

  $effect(() => {
    const ctrl = new AbortController();
    fetch("/api/ai/career-map", { signal: ctrl.signal })
      .then((r) => r.json())
      .then((result) => {
        if (result.graph) {
          graph = result.graph;
          aiReasoning = result.reasoning || null;
        }
        aiLoading = false;
      })
      .catch(() => { aiError = true; aiLoading = false; });
    return () => ctrl.abort();
  });

  function showFallback() {
    graph = data.graph;
    aiError = false;
    aiLoading = false;
  }

  const tierLabels: Record<string, string> = {
    current: "Current",
    next: "Next Role",
    stretch: "Stretch",
    "long-term": "Long-Term",
  };

  const currentRole = graph?.nodes.find((n: any) => n.tier === "current");
  const currentRank = currentRole ? seniorityRank(currentRole.seniority) : -1;

  function matchesPrevious(name: string): boolean {
    const n = name.toLowerCase().replace(/^(junior|mid|senior|staff|principal)\s+/, "");
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
      filtered.sort((a: any, b: any) => TIER_ORDER.indexOf(a.tier) - TIER_ORDER.indexOf(b.tier));
      let xOffset = 0;
      let zIndex = 100;
      if (currentRank >= 0) {
        if (rank < currentRank) { xOffset = -1; zIndex = 70; }
        else if (rank > currentRank) { xOffset = 1; zIndex = 130; }
      }
      return { rank, label: filtered[0].seniority, xOffset, zIndex, nodes: filtered };
    }).filter((r): r is NonNullable<typeof r> => r !== null);
  });

  let insight = $state<string | null>(null);
  let insightLoading = $state(false);

  $effect(() => {
    const role = selectedRole;
    if (!role) { insight = null; return; }
    insightLoading = true;
    insight = null;
    const ctrl = new AbortController();
    fetch(`/api/ai/insight?roleId=${role.id}`, { signal: ctrl.signal })
      .then((r) => r.json())
      .then((d) => { insight = d.insight || null; insightLoading = false; })
      .catch(() => { insightLoading = false; });
    return () => ctrl.abort();
  });

  const SENIORITY_LABELS: Record<string, string> = {
    junior: "Junior",
    mid: "Mid",
    senior: "Senior",
    lead: "Lead",
    staff: "Staff",
    principal: "Principal",
  };
</script>

<div class="mx-auto max-w-6xl px-4 py-8">
  <header class="mb-8">
    <h1 class="text-3xl font-bold text-foreground">Career Map</h1>
    <p class="mt-1 text-muted-foreground">Your career graph &mdash; visualize your path</p>
    {#if aiLoading}
      <p class="mt-3 italic text-muted-foreground">Generating AI-powered career map...</p>
    {:else if aiError}
      <p class="mt-3 text-sm text-danger">Could not generate AI career map.</p>
      <Button variant="outline" size="sm" class="mt-2" onclick={showFallback}>Show example map</Button>
    {:else if aiReasoning}
      <p class="mt-3 rounded-lg bg-brand/10 px-4 py-2 text-sm text-brand">{aiReasoning}</p>
    {/if}
  </header>

  <div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
    <div class="lg:col-span-2">
      <Card.Root>
        <Card.Header>
          <Card.Title>Skill Progression</Card.Title>
        </Card.Header>
        <Card.Content>
          {#if graph}
          <!-- Unified seniority-line layout (desktop + mobile) -->
          <div class="flex flex-col gap-6 lg:gap-8">
            {#each seniorityRows as row}
              <div
                class="flex flex-wrap items-start gap-4 transition-all duration-300"
                style="position: relative; z-index: {row.zIndex}; transform: translateX(clamp(-48px, {row.xOffset * 2}vw, 48px));"
              >
                <div class="w-20 shrink-0 pt-2 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {SENIORITY_LABELS[row.label.toLowerCase()] || row.label}
                </div>
                <div class="flex flex-1 flex-wrap items-center gap-3">
                  {#each row.nodes as node}
                    <button
                      onclick={() => selectedRole = node}
                      class="cursor-pointer rounded-lg border px-3 py-2.5 text-left text-sm transition-all hover:shadow-md focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none {node.tier === 'current' ? 'ring-2 ring-tier-current bg-tier-current/10' : node.tier === 'next' ? 'border-tier-next bg-tier-next/10' : node.tier === 'stretch' ? 'border-tier-stretch bg-tier-stretch/10' : 'border-tier-long-term bg-tier-long-term/10'} {node.tier === 'stretch' || node.tier === 'long-term' ? 'opacity-70' : ''}"
                    >
                      <div class="font-medium text-foreground">{node.name}</div>
                      <div class="mt-0.5 flex items-center gap-1">
                        <Badge variant="outline" size="xs">{node.category}</Badge>
                        <span class="text-[10px] uppercase tracking-wide {node.tier === 'current' ? 'text-tier-current-foreground' : node.tier === 'next' ? 'text-tier-next-foreground' : node.tier === 'stretch' ? 'text-tier-stretch-foreground' : 'text-tier-long-term-foreground'}">
                          {tierLabels[node.tier]}
                        </span>
                      </div>
                      {#if node.matchScore !== undefined}
                        <div class="mt-0.5 text-xs text-muted-foreground">Match: {node.matchScore}%</div>
                      {/if}
                    </button>
                  {/each}
                </div>
              </div>
            {/each}
          </div>
          {:else}
            <p class="py-8 text-center text-sm text-muted-foreground">Waiting for AI to generate your personalized career map...</p>
          {/if}
        </Card.Content>
      </Card.Root>
    </div>

    <!-- Detail panel (unchanged) -->
    <div>
      {#if selectedRole}
        <Card.Root>
          <Card.Header>
            <Card.Title>{selectedRole.name}</Card.Title>
            <Card.Description>
              <Badge variant="outline">{selectedRole.category}</Badge>
              <Badge variant="outline">{selectedRole.seniority}</Badge>
              <Badge class="ml-1" variant={selectedRole.tier === 'current' ? 'default' : 'secondary'}>{tierLabels[selectedRole.tier]}</Badge>
            </Card.Description>
          </Card.Header>
          <Card.Content class="space-y-4">
            {#if selectedRole.description}
              <p class="text-sm text-muted-foreground">{selectedRole.description}</p>
            {/if}

            {#if insightLoading}
              <p class="text-xs text-muted-foreground italic">Generating insight...</p>
            {:else if insight}
              <p class="rounded-lg bg-muted px-3 py-2 text-sm text-muted-foreground">{insight}</p>
            {/if}

            {#if selectedRole.matchScore !== undefined}
              <div>
                <div class="mb-1 flex items-center justify-between">
                  <p class="text-sm font-medium text-foreground">Match Score</p>
                  <span class="text-lg font-bold {selectedRole.matchScore >= 60 ? 'text-success' : selectedRole.matchScore >= 40 ? 'text-warning' : 'text-danger'}">{selectedRole.matchScore}%</span>
                </div>
                <div class="h-2 w-full rounded-full bg-muted">
                  <div
                    class="h-2 rounded-full transition-all {selectedRole.matchScore >= 60 ? 'bg-success' : selectedRole.matchScore >= 40 ? 'bg-warning' : 'bg-danger'}"
                    style="width: {selectedRole.matchScore}%"
                  ></div>
                </div>
              </div>
            {/if}

            {#if selectedRole.tier !== 'current'}
              <div class="pt-2">
                <a href="/career-quest?roleId={selectedRole.id}">
                  <Button size="sm" class="w-full">Path to unlock</Button>
                </a>
              </div>
            {/if}
          </Card.Content>
        </Card.Root>
      {:else}
        <Card.Root>
          <Card.Content>
            <p class="text-sm text-muted-foreground">Click a role to see details</p>
          </Card.Content>
        </Card.Root>
      {/if}

      {#if suggestions.length}
        <Card.Root class="mt-4">
          <Card.Header>
            <Card.Title>Suggested Quests</Card.Title>
          </Card.Header>
          <Card.Content class="space-y-3">
            {#each suggestions as s}
              <div class="rounded-lg border p-3">
                <p class="text-sm font-medium text-foreground">{s.title}</p>
                <p class="text-xs text-muted-foreground">{s.description}</p>
                <div class="mt-2 flex items-center justify-between">
                  <span class="text-xs text-muted-foreground">{s.estimatedTime}</span>
                  <a href="/career-quest?roleId={s.roleId}">
                    <Button size="xs" variant="outline">Start</Button>
                  </a>
                </div>
              </div>
            {/each}
          </Card.Content>
        </Card.Root>
      {/if}
    </div>
  </div>
</div>
