<script lang="ts">
  import type { Job } from "$generated/prisma/client";
  import { Badge } from "$lib/components/ui/badge";

  let { job }: { job: Job } = $props();

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

<a
  href="/jobs/{job.id}"
  class="group/card block rounded-xl border border-border bg-card p-4 transition-all hover:shadow-md sm:p-5"
>
  <div class="flex items-start justify-between gap-4">
    <div class="min-w-0 flex-1">
      <div class="flex items-center gap-2">
        <div class="flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand/10 text-sm font-bold text-brand">
          {job.company.charAt(0)}
        </div>
        <div>
          <p class="text-sm font-medium text-muted-foreground">{job.company}</p>
        </div>
      </div>
      <h2 class="mt-2 text-lg font-semibold text-foreground group-hover/card:text-brand">{job.title}</h2>
      <div class="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
        {#if job.location}
          <span>{job.location}</span>
        {/if}
        <span>{job.locationType}</span>
        {#if job.salaryMin || job.salaryMax}
          <span class="font-medium text-foreground">{formatSalary(job.salaryMin, job.salaryMax)}</span>
        {/if}
      </div>
    </div>
    <Badge variant="outline" size="xs">{formatType(job.type)}</Badge>
  </div>
  <div class="mt-3 flex flex-wrap gap-1.5">
    <Badge variant="secondary" size="xs">{job.seniority}</Badge>
    <Badge variant="secondary" size="xs">{job.category}</Badge>
    <Badge variant="outline" size="xs">{LOCATION_LABELS[job.locationType] || job.locationType}</Badge>
    {#each job.skills.slice(0, 4) as skill}
      <Badge variant="outline" size="xs">{skill}</Badge>
    {/each}
    {#if job.skills.length > 4}
      <Badge variant="outline" size="xs">+{job.skills.length - 4}</Badge>
    {/if}
  </div>
</a>
