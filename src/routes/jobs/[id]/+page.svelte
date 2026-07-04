<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import { Badge } from "$lib/components/ui/badge";
  import { Label } from "$lib/components/ui/label";
  import { Textarea } from "$lib/components/ui/textarea";

  let { data } = $props();
  let { job, application, skillGaps } = $state(data);
  let step = $state<"idle" | "gaps" | "cover" | "submitted">("idle");
  let coverLetter = $state("");

  let gaps = $state(
    skillGaps.map((s: string) => ({ skill: s, claimed: false, evidence: "" }))
  );

  let userSkills = $state(
    job.skills.filter((s: string) => !skillGaps.includes(s))
  );

  function formatSalary(min?: number | null, max?: number | null) {
    if (!min && !max) return "";
    const fmt = (n: number) => "RM" + (n / 1000).toFixed(0) + "k";
    if (min && max) return `${fmt(min)} - ${fmt(max)}`;
    if (min) return `From ${fmt(min)}`;
    return `Up to ${fmt(max!)}`;
  }

  async function submitApplication() {
    const form = new FormData();
    if (coverLetter) form.set("coverLetter", coverLetter);
    for (const g of gaps) {
      form.set(`claim_${g.skill}`, g.claimed ? "true" : "false");
      if (g.claimed && g.evidence) form.set(`evidence_${g.skill}`, g.evidence);
    }
    await fetch("?/apply", { method: "POST", body: form });
    step = "submitted";
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
</script>

<div class="mx-auto max-w-4xl px-4 py-8">
  <a href="/" class="mb-4 inline-flex text-sm text-muted-foreground hover:text-foreground">&larr; Back to jobs</a>

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
          <span class="rounded bg-muted px-1.5 py-0.5 text-xs font-medium">{job.locationType}</span>
          {#if job.salaryMin || job.salaryMax}
            <span class="font-semibold text-foreground">{formatSalary(job.salaryMin, job.salaryMax)}</span>
          {/if}
        </div>
      </div>
      <div class="shrink-0">
        <Badge variant="outline">{job.type.replace("_", " ")}</Badge>
      </div>
    </div>

    <div class="mt-4 flex flex-wrap gap-1.5">
      <Badge variant="secondary" class="text-xs">{job.seniority}</Badge>
      <Badge variant="secondary" class="text-xs">{job.category}</Badge>
      {#each job.skills as skill}
        <Badge variant="ghost" class="text-xs">{skill}</Badge>
      {/each}
    </div>
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
      {#if application || step === "submitted"}
        <div class="rounded-xl border border-border bg-card p-6 text-center">
          <div class="mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-success/10">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-success"><path d="M20 6 9 17l-5-5"/></svg>
          </div>
          <p class="font-medium text-foreground">Application submitted</p>
          {#if application}
            <Badge variant={statusVariant[application.status] || "outline"} class="mt-2">
              {statusLabel[application.status] || application.status}
            </Badge>
          {/if}
        </div>
      {:else if step === "cover"}
        <div class="rounded-xl border border-border bg-card p-6">
          <h3 class="font-semibold text-foreground">Cover Letter</h3>
          <div class="mt-4 space-y-3">
            <div>
              <Label>Cover Letter (optional)</Label>
              <Textarea bind:value={coverLetter} class="mt-1 min-h-[160px]" placeholder="Tell them why you're a great fit..." />
            </div>
            <div class="flex gap-2">
              <Button onclick={submitApplication}>Submit application</Button>
              <Button variant="ghost" onclick={() => step = "gaps"}>Back</Button>
            </div>
          </div>
        </div>
      {:else if step === "gaps"}
        <div class="rounded-xl border border-border bg-card p-6">
          <h3 class="font-semibold text-foreground">Skill gaps</h3>
          <p class="mt-1 text-xs text-muted-foreground">Do you have these skills? Tell us where you used them.</p>
          <div class="mt-4 space-y-4">
            {#each gaps as g, i}
              <div class="rounded-lg border border-border bg-muted/50 p-3">
                <div class="flex items-center justify-between">
                  <span class="text-sm font-medium text-foreground">{g.skill}</span>
                  <button
                    onclick={() => gaps[i].claimed = !gaps[i].claimed}
                    class="rounded-md px-2 py-1 text-xs font-medium transition-colors {g.claimed ? 'bg-success/20 text-success' : 'bg-muted text-muted-foreground'}"
                  >
                    {g.claimed ? "I have this" : "Missing"}
                  </button>
                </div>
                {#if g.claimed}
                  <textarea
                    bind:value={gaps[i].evidence}
                    placeholder="Where did you use this? (project, job, etc.)"
                    class="border-input mt-2 w-full rounded-lg border bg-transparent px-2 py-1.5 text-xs outline-none focus:border-ring"
                    rows="2"
                  ></textarea>
                {/if}
              </div>
            {/each}
          </div>
          <Button onclick={() => step = "cover"} class="mt-4 w-full">Continue</Button>
          <button onclick={() => step = "idle"} class="mt-2 w-full cursor-pointer text-center text-xs text-muted-foreground hover:text-foreground">Cancel</button>
        </div>
      {:else}
        <div class="rounded-xl border border-border bg-card p-6">
          <h3 class="font-semibold text-foreground">Apply for this job</h3>
          <p class="mt-2 text-sm text-muted-foreground">Ready to apply? Submit your application.</p>
          <Button onclick={() => step = skillGaps.length > 0 ? "gaps" : "cover"} class="mt-4 w-full">Apply now</Button>
        </div>
      {/if}

      <div class="rounded-xl border border-border bg-card p-6">
        <h3 class="text-sm font-semibold text-foreground">Skill match</h3>
        <div class="mt-3 space-y-3">
          {#if userSkills.length}
            <div>
              <p class="text-xs text-muted-foreground">Matched</p>
              <div class="mt-1 flex flex-wrap gap-1">
                {#each userSkills as s}
                  <Badge variant="secondary" size="xs" class="text-success">{s}</Badge>
                {/each}
              </div>
            </div>
          {/if}
          {#if skillGaps.length}
            <div>
              <p class="text-xs text-danger">Gaps</p>
              <div class="mt-1 flex flex-wrap gap-1">
                {#each skillGaps as s}
                  <Badge variant="outline" size="xs" class="text-danger">{s}</Badge>
                {/each}
              </div>
            </div>
          {/if}
        </div>
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
