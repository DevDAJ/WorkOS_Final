<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import { Badge } from "$lib/components/ui/badge";
  import * as Dialog from "$lib/components/ui/dialog";

  let { data } = $props();
  let { job, application, skillGaps, strengths, matchScore, resume, aiKeywords = [], internshipBlocked = false } = $state(data);

  let flashMessage = $state("");

  const RING_RADIUS = 16;
  const RING_CIRC = 2 * Math.PI * RING_RADIUS;

  const scoreColor = $derived(
    matchScore >= 60 ? "text-success stroke-success" :
    matchScore >= 40 ? "text-warning stroke-warning" :
    "text-danger stroke-danger"
  );

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

  let viewingResume = $state<string | null>(null);

  function downloadPdf(id: string) {
    window.open("/api/resume/" + id + "/pdf", "_blank");
  }

  const statusLabel: Record<string, string> = {
    PENDING: "Applied",
    REVIEWING: "Under Review",
    INTERVIEWED: "Interviewed",
    OFFERED: "Offered",
    REJECTED: "Not Selected",
    WITHDRAWN: "Withdrawn",
  };

  const statusVariant: Record<string, "outline" | "default" | "secondary" | "destructive"> = {
    PENDING: "outline",
    REVIEWING: "default",
    INTERVIEWED: "secondary",
    OFFERED: "default",
    REJECTED: "destructive",
    WITHDRAWN: "outline",
  };

  async function addSkill(name: string) {
    const owned = strengths.some((s: string) => s.toLowerCase() === name.toLowerCase());
    if (owned) {
      flashMessage = `${name} is already in your profile`;
      setTimeout(() => flashMessage = "", 3000);
      return;
    }

    const res = await fetch("?/addSkill", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ name }),
    });
    if (res.ok) {
      skillGaps = skillGaps.filter((s: string) => s.toLowerCase() !== name.toLowerCase());
      strengths = [...strengths, name];
      const total = strengths.length + skillGaps.length;
      matchScore = total > 0 ? Math.round((strengths.length / total) * 100) : 0;
      flashMessage = `${name} added to your profile`;
      setTimeout(() => flashMessage = "", 3000);
    }
  }
</script>

<div class="mx-auto max-w-4xl px-4 py-8">
  <a href="/jobs" class="mb-4 inline-flex text-sm text-muted-foreground hover:text-foreground">&larr; Back to jobs</a>

  <div class="rounded-xl border border-border bg-card p-6 sm:p-8">
    <div class="flex items-start justify-between gap-4">
      <div class="min-w-0">
        <div class="flex items-center gap-3">
          <div class="flex size-12 items-center justify-center rounded-xl bg-brand/10 text-xl font-bold text-brand">
            {job.company.charAt(0)}
          </div>
          <div>
            <p class="text-sm font-medium text-muted-foreground">{job.company}</p>
            {#if job.companyWebsite}
              <a href={job.companyWebsite} target="_blank" class="text-xs text-muted-foreground hover:text-foreground">{job.companyWebsite.replace(/^https?:\/\//, "")}</a>
            {/if}
          </div>
        </div>
        <h1 class="mt-4 text-2xl font-bold text-foreground sm:text-3xl">{job.title}</h1>
        <div class="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
          {#if job.location}<span>{job.location}</span>{/if}
          <span class="rounded bg-muted px-1.5 py-0.5 text-xs font-medium">{LOCATION_LABELS[job.locationType] || job.locationType}</span>
          {#if job.salaryMin || job.salaryMax}
            <span class="font-semibold text-foreground">{formatSalary(job.salaryMin, job.salaryMax)}</span>
          {/if}
        </div>
      </div>
      <div class="shrink-0">
        <Badge variant="outline">{formatType(job.type)}</Badge>
      </div>
    </div>

    <div class="mt-4 flex flex-wrap gap-1.5">
      <Badge variant="secondary" class="text-xs">{job.seniority}</Badge>
      <Badge variant="secondary" class="text-xs">{job.category}</Badge>
      {#each job.skills as skill}
        <Badge variant="outline" class="text-xs">{skill}</Badge>
      {/each}
    </div>
    {#if aiKeywords.length > 0}
      <div class="mt-3">
        <p class="mb-1.5 text-xs font-medium text-muted-foreground">AI-extracted keywords from description</p>
        <div class="flex flex-wrap gap-1.5">
          {#each aiKeywords.filter((k: string) => !job.skills.some((s: string) => s.toLowerCase() === k.toLowerCase())) as kw}
            <button type="button" onclick={() => addSkill(kw)} class="cursor-pointer rounded-full border border-brand/20 bg-brand/10 px-2.5 py-0.5 text-xs font-medium text-brand transition-colors hover:bg-brand/20">{kw}</button>
          {/each}
        </div>
      </div>
    {/if}
  </div>

  <div class="mt-6 grid gap-6 lg:grid-cols-3">
    <div class="space-y-6 lg:col-span-2">
      <div class="rounded-xl border border-border bg-card p-6">
        <h2 class="text-lg font-semibold text-foreground">About the role</h2>
        <p class="mt-3 text-sm leading-relaxed text-muted-foreground whitespace-pre-line">{job.description}</p>
      </div>

      {#if job.responsibilities.length}
        <div class="rounded-xl border border-border bg-card p-6">
          <h2 class="text-lg font-semibold text-foreground">Responsibilities</h2>
          <ul class="mt-3 space-y-2">
            {#each job.responsibilities as r}
              <li class="flex gap-2 text-sm text-muted-foreground">
                <span class="mt-1 block size-1.5 shrink-0 rounded-full bg-brand"></span>
                {r}
              </li>
            {/each}
          </ul>
        </div>
      {/if}

      <div class="rounded-xl border border-border bg-card p-6">
        <h2 class="text-lg font-semibold text-foreground">Requirements</h2>
        <ul class="mt-3 space-y-2">
          {#each job.requirements as r}
            <li class="flex gap-2 text-sm text-muted-foreground">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="mt-0.5 shrink-0 text-success"><path d="M20 6 9 17l-5-5"/></svg>
              {r}
            </li>
          {/each}
        </ul>
      </div>

      {#if job.niceToHave.length}
        <div class="rounded-xl border border-border bg-card p-6">
          <h2 class="text-lg font-semibold text-foreground">Nice to Have</h2>
          <ul class="mt-3 space-y-2">
            {#each job.niceToHave as n}
              <li class="flex gap-2 text-sm text-muted-foreground">
                <span class="mt-1 block size-1.5 shrink-0 rounded-full bg-muted-foreground/50"></span>
                {n}
              </li>
            {/each}
          </ul>
        </div>
      {/if}
    </div>

    <div class="space-y-4">
      {#if flashMessage}
        <div class="rounded-lg border border-border bg-card px-4 py-2.5 text-sm text-foreground">{flashMessage}</div>
      {/if}

      {#if internshipBlocked}
        <div class="rounded-xl border border-border bg-card p-6 text-center">
          <div class="mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-muted">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-muted-foreground"><path d="M12 2a4 4 0 0 0-4 4v2H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V10a2 2 0 0 0-2-2h-2V6a4 4 0 0 0-4-4Z"/><path d="M8 10V6a4 4 0 0 1 8 0v4"/></svg>
          </div>
          <p class="font-medium text-foreground">Students only</p>
          <p class="mt-1 text-xs text-muted-foreground">This internship is only available to current students.</p>
          <a href="/living-cv" class="mt-4 inline-flex w-full items-center justify-center rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background hover:bg-foreground/90">Add education to your profile</a>
        </div>
      {:else if application && application.status !== "WITHDRAWN"}
        <div class="rounded-xl border border-border bg-card p-6 text-center">
          <div class="mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-success/10">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-success"><path d="M20 6 9 17l-5-5"/></svg>
          </div>
          <p class="font-medium text-foreground">Application submitted</p>
          <Badge variant={statusVariant[application.status] || "outline"} class="mt-2">
            {statusLabel[application.status] || application.status}
          </Badge>
          {#if resume}
            <Button onclick={() => viewingResume = resume.id} class="mt-3 w-full" size="sm" variant="outline">View Resume</Button>
          {/if}
        </div>
      {:else if application?.status === "WITHDRAWN"}
        <div class="rounded-xl border border-border bg-card p-6 text-center">
          <div class="mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-muted">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-muted-foreground"><path d="M21 12a9 9 0 1 1-9-9"/><path d="M12 3v6h6"/></svg>
          </div>
          <p class="font-medium text-foreground">Application withdrawn</p>
          <p class="mt-1 text-xs text-muted-foreground">You can re-apply at any time.</p>
          <a href="/jobs/{job.id}/apply" class="mt-4 inline-flex w-full items-center justify-center rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background hover:bg-foreground/90">Re-apply</a>
        </div>
      {:else}
        <div class="rounded-xl border border-border bg-card p-6">
          <h3 class="font-semibold text-foreground">Apply for this job</h3>
          <p class="mt-2 text-sm text-muted-foreground">Ready to apply? Submit your application.</p>
          <a href="/jobs/{job.id}/apply" class="mt-4 inline-flex w-full items-center justify-center rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background hover:bg-foreground/90">Apply now</a>
        </div>
      {/if}

      <div class="rounded-xl border border-border bg-card p-6">
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
                  <Badge variant="secondary" size="xs" class="text-success">{s}</Badge>
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

      <div class="rounded-xl border border-border bg-card p-6">
        <h3 class="text-sm font-semibold text-foreground">Job Details</h3>
        <dl class="mt-3 space-y-2 text-sm">
          <div class="flex justify-between">
            <dt class="text-muted-foreground">Category</dt>
            <dd class="font-medium text-foreground">{job.category}</dd>
          </div>
          <div class="flex justify-between">
            <dt class="text-muted-foreground">Seniority</dt>
            <dd class="font-medium text-foreground">{job.seniority}</dd>
          </div>
          <div class="flex justify-between">
            <dt class="text-muted-foreground">Type</dt>
            <dd class="font-medium text-foreground">{job.type.replace("_", " ")}</dd>
          </div>
          {#if job.companySize}
            <div class="flex justify-between">
              <dt class="text-muted-foreground">Company size</dt>
              <dd class="font-medium text-foreground">{job.companySize}</dd>
            </div>
          {/if}
        </dl>
      </div>
    </div>
  </div>
</div>

<Dialog.Root open={viewingResume !== null} onopenchange={(e) => { if (!e.detail) viewingResume = null; }}>
  <Dialog.Content class="!max-w-[90vw] !w-[90vw] !h-[90vh] flex flex-col p-0 gap-0" showCloseButton={false}>
    <div class="flex items-center justify-between border-b border-border px-5 py-3">
      <Dialog.Title class="text-sm font-semibold text-foreground m-0">Resume</Dialog.Title>
      <div class="flex gap-2">
        <Button size="sm" variant="outline" onclick={() => viewingResume && downloadPdf(viewingResume)}>Download PDF</Button>
        <Button size="sm" variant="ghost" onclick={() => viewingResume = null}>Close</Button>
      </div>
    </div>
    <div class="flex-1 min-h-0">
      {#if viewingResume}
        <iframe src="/api/resume/{viewingResume}/html" class="h-full w-full border-0" title="Resume" />
      {/if}
    </div>
  </Dialog.Content>
</Dialog.Root>
