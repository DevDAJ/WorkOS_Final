<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import { Badge } from "$lib/components/ui/badge";
  import { Label } from "$lib/components/ui/label";
  import { Textarea } from "$lib/components/ui/textarea";

  let { data } = $props();
  let { job, skillGaps, strengths, matchScore, workExps, userProjects, aiKeywords = [] } = $state(data);

  let step = $state<"gaps" | "cover">(skillGaps.length > 0 ? "gaps" : "cover");
  let coverLetter = $state("");
  let flashMessage = $state("");
  let addedSkills = $state(new Set<string>());

  let gaps = $state(
    skillGaps.map((s: string) => ({ skill: s, claimed: false, evidence: "", otherText: "" }))
  );

  let freshAiKeywords = $state(
    aiKeywords.filter((k: string) => !job.skills.some((s: string) => s.toLowerCase() === k.toLowerCase()))
  );

  const RING_RADIUS = 16;
  const RING_CIRC = 2 * Math.PI * RING_RADIUS;

  const scoreColor = $derived(
    matchScore >= 60 ? "text-success stroke-success" :
    matchScore >= 40 ? "text-warning stroke-warning" :
    "text-danger stroke-danger"
  );

  function flash(msg: string) {
    flashMessage = msg;
    setTimeout(() => flashMessage = "", 3000);
  }

  async function addSkill(name: string) {
    const lowered = name.toLowerCase();
    const owned = strengths.some((s: string) => s.toLowerCase() === lowered);
    if (owned) {
      flash(`${name} is already in your profile`);
      return;
    }
    const res = await fetch("?/addSkill", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ name }),
    });
    if (res.ok) {
      skillGaps = skillGaps.filter((s: string) => s.toLowerCase() !== lowered);
      gaps = gaps.filter((g) => g.skill.toLowerCase() !== lowered);
      strengths = [...strengths, name];
      const total = strengths.length + skillGaps.length;
      matchScore = total > 0 ? Math.round((strengths.length / total) * 100) : 0;
      addedSkills.add(name);
      flash(`${name} added to your profile`);
    }
  }

  async function removeSkill(name: string) {
    const lowered = name.toLowerCase();
    const res = await fetch("?/removeSkill", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ name }),
    });
    if (res.ok) {
      strengths = strengths.filter((s: string) => s.toLowerCase() !== lowered);
      if (!skillGaps.some((s: string) => s.toLowerCase() === lowered)) {
        skillGaps = [...skillGaps, name];
      }
      if (!gaps.some((g) => g.skill.toLowerCase() === lowered)) {
        gaps = [...gaps, { skill: name, claimed: false, evidence: "", otherText: "" }];
      }
      const total = strengths.length + skillGaps.length;
      matchScore = total > 0 ? Math.round((strengths.length / total) * 100) : 0;
      addedSkills.delete(name);
      flash(`${name} removed from your profile`);
    }
  }

  function formatSalary(min?: number | null, max?: number | null) {
    if (!min && !max) return "";
    const fmt = (n: number) => "RM" + (n / 1000).toFixed(0) + "k";
    if (min && max) return `${fmt(min)} - ${fmt(max)}`;
    if (min) return `From ${fmt(min)}`;
    return `Up to ${fmt(max!)}`;
  }

  function formatType(t: string): string {
    return t.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
  }

  const LOCATION_LABELS: Record<string, string> = {
    ON_SITE: "On-site", REMOTE: "Remote", HYBRID: "Hybrid",
  };
</script>

<div class="mx-auto max-w-3xl px-4 py-8">
  <a href="/jobs/{job.id}" class="mb-4 inline-flex text-sm text-muted-foreground hover:text-foreground">&larr; Back to job</a>

  <div class="rounded-xl border border-border bg-card p-6 sm:p-8">
    <div class="flex items-start justify-between gap-4">
      <div class="min-w-0">
        <div class="flex items-center gap-3">
          <div class="flex size-12 items-center justify-center rounded-xl bg-brand/10 text-xl font-bold text-brand">
            {job.company.charAt(0)}
          </div>
          <div>
            <p class="text-sm font-medium text-muted-foreground">{job.company}</p>
          </div>
        </div>
        <h1 class="mt-3 text-xl font-bold text-foreground sm:text-2xl">{job.title}</h1>
        <div class="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
          {#if job.location}<span>{job.location}</span>{/if}
          <span class="rounded bg-muted px-1.5 py-0.5 text-xs font-medium">{LOCATION_LABELS[job.locationType] || job.locationType}</span>
          {#if job.salaryMin || job.salaryMax}
            <span class="font-semibold text-foreground">{formatSalary(job.salaryMin, job.salaryMax)}</span>
          {/if}
        </div>
      </div>
      <Badge variant="outline">{formatType(job.type)}</Badge>
    </div>
    <div class="mt-3 flex flex-wrap gap-1.5">
      <Badge variant="secondary" class="text-xs">{job.seniority}</Badge>
      <Badge variant="secondary" class="text-xs">{job.category}</Badge>
      {#each job.skills as skill}
        <Badge variant="outline" class="text-xs">{skill}</Badge>
      {/each}
    </div>
  </div>

  {#if flashMessage}
    <div class="mt-4 rounded-lg border border-border bg-card px-4 py-2.5 text-sm text-foreground">{flashMessage}</div>
  {/if}

  {#if freshAiKeywords.length > 0}
    <div class="mt-6">
      <p class="mb-1.5 text-xs font-medium text-muted-foreground">AI-extracted keywords from description</p>
      <div class="flex flex-wrap gap-1.5">
        {#each freshAiKeywords as kw}
          <span class="rounded-full border border-brand/20 bg-brand/10 px-2.5 py-0.5 text-xs font-medium text-brand">{kw}</span>
        {/each}
      </div>
    </div>
  {/if}

  {#if step === "gaps"}
    <div class="mt-6 rounded-xl border border-border bg-card p-6">
      <h2 class="text-lg font-semibold text-foreground">Skill gaps</h2>
      <p class="mt-1 text-sm text-muted-foreground">Do you have these skills? Tell us where you used them.</p>
      <div class="mt-4 space-y-4">
        {#each gaps as g, i}
          <div
            onclick={() => gaps[i].claimed = !gaps[i].claimed}
            onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); gaps[i].claimed = !gaps[i].claimed; } }}
            role="button"
            tabindex="0"
            class="cursor-pointer rounded-lg border border-border bg-muted/50 p-3 transition-colors hover:border-brand/30 hover:bg-brand/5"
          >
            <div class="flex items-center justify-between">
              <span class="text-sm font-medium text-foreground">{g.skill}</span>
              <button
                type="button"
                onclick={(e) => { e.stopPropagation(); gaps[i].claimed = !gaps[i].claimed; }}
                class="rounded-md px-2 py-1 text-xs font-medium transition-colors {g.claimed ? 'bg-success/20 text-success' : 'bg-muted text-muted-foreground'}"
              >
                {g.claimed ? "I have this" : "Missing"}
              </button>
            </div>
            {#if g.claimed}
              <select
                bind:value={gaps[i].evidence}
                onclick={(e) => e.stopPropagation()}
                class="border-input mt-2 w-full rounded-lg border bg-transparent px-2 py-1.5 text-xs outline-none focus:border-ring"
              >
                <option value="">Select where you used this...</option>
                {#if workExps.length}
                  <optgroup label="Work Experience">
                    {#each workExps as we}
                      <option value="work_{we.id}">{we.role} at {we.company}</option>
                    {/each}
                  </optgroup>
                {/if}
                {#if userProjects.length}
                  <optgroup label="Projects">
                    {#each userProjects as p}
                      <option value="proj_{p.id}">{p.title}</option>
                    {/each}
                  </optgroup>
                {/if}
                <option value="__other__">Other (type below)</option>
              </select>
              {#if gaps[i].evidence === "__other__"}
                <textarea
                  bind:value={gaps[i].otherText}
                  onclick={(e) => e.stopPropagation()}
                  placeholder="Describe where you used this skill..."
                  class="border-input mt-2 w-full rounded-lg border bg-transparent px-2 py-1.5 text-xs outline-none focus:border-ring"
                  rows="2"
                ></textarea>
              {/if}
            {/if}
          </div>
        {/each}
      </div>
      <Button onclick={() => step = "cover"} class="mt-4">Continue</Button>
    </div>
  {:else}
    <form method="POST" class="mt-6">
      <div class="rounded-xl border border-border bg-card p-6">
        <h2 class="text-lg font-semibold text-foreground">Cover Letter</h2>
        <div class="mt-4 space-y-3">
          <div>
            <Label>Cover Letter (optional)</Label>
            <Textarea name="coverLetter" bind:value={coverLetter} class="mt-1 min-h-[160px]" maxlength="10000" placeholder="Tell them why you're a great fit..." />
          </div>

          {#each gaps as g}
            <input type="hidden" name="claim_{g.skill}" value={g.claimed ? "true" : "false"} />
            {#if g.claimed}
              <input type="hidden" name="evidence_{g.skill}" value={g.evidence === "__other__" ? g.otherText : g.evidence} />
            {/if}
          {/each}

          <div class="flex gap-2">
            <Button type="submit">Submit application</Button>
            {#if skillGaps.length > 0}
              <Button type="button" variant="ghost" onclick={() => step = "gaps"}>Back</Button>
            {/if}
          </div>
        </div>
      </div>
    </form>
  {/if}

  <div class="mt-4 rounded-xl border border-border bg-card p-5">
    <div class="flex items-center gap-3">
      <div class="relative size-12 shrink-0">
        <svg viewBox="0 0 40 40" class="size-12 -rotate-90">
          <circle cx="20" cy="20" r={RING_RADIUS} fill="none" stroke-width="4" class="stroke-muted" opacity="0.15"/>
          <circle cx="20" cy="20" r={RING_RADIUS} fill="none" stroke-width="4"
            stroke-dasharray={RING_CIRC} stroke-dashoffset={RING_CIRC * (1 - matchScore / 100)}
            stroke-linecap="round" class={scoreColor} style="transition: stroke-dashoffset 0.6s"/>
        </svg>
        <span class="absolute inset-0 flex items-center justify-center text-xs font-bold {scoreColor.split(' ')[0]}">{matchScore}</span>
      </div>
      <div>
        <p class="font-semibold text-foreground">Skill match</p>
        <Badge variant="outline" size="xs" class="mt-0.5 {scoreColor.split(' ')[0]} border-current">{matchScore}% matched</Badge>
      </div>
    </div>
    {#if strengths.length || skillGaps.length}
      <div class="mt-3 space-y-2">
        {#if strengths.length}
          <div class="flex flex-wrap gap-1">
            {#each strengths as s}
              <span class="inline-flex items-center gap-1 rounded-full border border-success/20 bg-success/10 px-2.5 py-0.5 text-xs font-medium text-success">
                {s}
                {#if addedSkills.has(s)}
                  <button type="button" onclick={() => removeSkill(s)} class="ml-0.5 leading-none text-success/60 hover:text-success">&times;</button>
                {/if}
              </span>
            {/each}
          </div>
        {/if}
        {#if skillGaps.length}
          <div class="flex flex-wrap gap-1">
            {#each skillGaps as s}
              <button type="button" onclick={() => addSkill(s)} class="cursor-pointer rounded-full border border-danger/20 bg-danger/10 px-2.5 py-0.5 text-xs font-medium text-danger transition-colors hover:bg-danger/20">{s}</button>
            {/each}
          </div>
        {/if}
      </div>
    {/if}
  </div>
</div>
