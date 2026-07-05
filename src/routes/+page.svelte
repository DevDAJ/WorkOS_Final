<script lang="ts">
  import { page } from "$app/stores";
  import { goto } from "$app/navigation";
  import { Button } from "$lib/components/ui/button";
  import { Badge } from "$lib/components/ui/badge";

  let { data } = $props();
  let jobs = $derived(data.jobs);
  let total = $derived(jobs.length);

  const PAGE_SIZE = 10;
  let currentPage = $state(1);
  let totalPages = $derived(Math.ceil(total / PAGE_SIZE));
  let paginatedJobs = $derived(jobs.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE));

  $effect(() => {
    data.jobs;
    currentPage = 1;
  });

  let search = $state($page.url.searchParams.get("search") || "");
  let category = $state($page.url.searchParams.get("category") || "");
  let seniority = $state($page.url.searchParams.get("seniority") || "");
  let locationType = $state($page.url.searchParams.get("locationType") || "");
  let type = $state($page.url.searchParams.get("type") || "");

  const categories = [
    "FRONTEND",
    "BACKEND",
    "FULLSTACK",
    "DEVOPS",
    "DATA",
    "ML",
    "MOBILE",
    "DESIGN",
    "PM",
    "QA",
    "SRE",
    "SECURITY",
  ];
  const seniorities = ["JUNIOR", "MID", "SENIOR", "STAFF", "PRINCIPAL"];
  const locationTypes = ["REMOTE", "HYBRID", "ON_SITE"];
  const types = ["FULL_TIME", "PART_TIME", "CONTRACT", "INTERN", "FREELANCE"];

  function buildUrl() {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (category) params.set("category", category);
    if (seniority) params.set("seniority", seniority);
    if (locationType) params.set("locationType", locationType);
    if (type) params.set("type", type);
    return `/${params.toString() ? "?" + params.toString() : ""}`;
  }

  function apply() {
    goto(buildUrl());
  }

  function goToPage(p: number) {
    currentPage = p;
  }

  function clearFilters() {
    search = "";
    category = "";
    seniority = "";
    locationType = "";
    type = "";
  }

  let hasFilters = $derived(
    search || category || seniority || locationType || type,
  );

  function formatSalary(min?: number | null, max?: number | null) {
    if (!min && !max) return "";
    const fmt = (n: number) => "RM" + (n / 1000).toFixed(0) + "k";
    if (min && max) return `${fmt(min)} - ${fmt(max)}`;
    if (min) return `From ${fmt(min)}`;
    return `Up to ${fmt(max!)}`;
  }

  function formatType(t: string): string {
    return t
      .replace(/_/g, " ")
      .toLowerCase()
      .replace(/\b\w/g, (c) => c.toUpperCase());
  }

  const LOCATION_LABELS: Record<string, string> = {
    ON_SITE: "On-site",
    REMOTE: "Remote",
    HYBRID: "Hybrid",
  };
</script>

<div class="mx-auto max-w-6xl px-4 py-8">
  <header class="mb-8">
    <h1 class="text-3xl font-bold text-foreground">Find your next role</h1>
    <p class="mt-1 text-muted-foreground">{total} open positions</p>
  </header>

  <div class="mb-6 flex flex-col gap-4">
    <div class="flex gap-2">
      <input
        type="text"
        bind:value={search}
        placeholder="Search by title, company, or skill..."
        class="border-input focus-visible:border-ring focus-visible:ring-ring/50 h-9 flex-1 rounded-lg border bg-transparent px-3 text-sm outline-none focus-visible:ring-3"
        onkeydown={(e) => e.key === "Enter" && apply()}
      />
      <Button onclick={apply}>Search</Button>
    </div>

    <div class="flex flex-wrap gap-2">
      <select
        bind:value={category}
        onchange={apply}
        class="border-input h-8 rounded-lg border bg-transparent px-2 text-xs outline-none"
      >
        <option value="">All Categories</option>
        {#each categories as c}<option value={c}>{c}</option>{/each}
      </select>
      <select
        bind:value={seniority}
        onchange={apply}
        class="border-input h-8 rounded-lg border bg-transparent px-2 text-xs outline-none"
      >
        <option value="">All Levels</option>
        {#each seniorities as s}<option value={s}>{s}</option>{/each}
      </select>
      <select
        bind:value={locationType}
        onchange={apply}
        class="border-input h-8 rounded-lg border bg-transparent px-2 text-xs outline-none"
      >
        <option value="">All Locations</option>
        {#each locationTypes as l}<option value={l}>{l}</option>{/each}
      </select>
      <select
        bind:value={type}
        onchange={apply}
        class="border-input h-8 rounded-lg border bg-transparent px-2 text-xs outline-none"
      >
        <option value="">All Types</option>
        {#each types as t}<option value={t}>{t.replace("_", " ")}</option
          >{/each}
      </select>
      {#if hasFilters}
        <button
          onclick={clearFilters}
          class="h-8 cursor-pointer rounded-lg px-2 text-xs text-muted-foreground hover:text-foreground"
          >Clear</button
        >
      {/if}
    </div>
  </div>

  {#if jobs.length === 0}
    <div class="flex flex-col items-center gap-2 py-20 text-center">
      <p class="text-lg font-medium text-foreground">No jobs found</p>
      <p class="text-sm text-muted-foreground">
        Try adjusting your filters or search terms.
      </p>
      <Button variant="outline" onclick={clearFilters} class="mt-2"
        >Clear filters</Button
      >
    </div>
  {:else}
    <div class="flex flex-col gap-3">
      {#each paginatedJobs as job}
        <a
          href="/jobs/{job.id}"
          class="group/card block rounded-xl border border-border bg-card p-4 transition-all hover:shadow-md sm:p-5"
        >
          <div class="flex items-start justify-between gap-4">
            <div class="min-w-0 flex-1">
              <div class="flex items-center gap-2">
                <span
                  class="flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand/10 text-sm font-bold text-brand"
                  >{job.company.charAt(0)}</span
                >
                <span class="text-sm font-medium text-muted-foreground"
                  >{job.company}</span
                >
              </div>
              <h2
                class="mt-2 text-lg font-semibold text-foreground group-hover/card:text-brand"
              >
                {job.title}
              </h2>
              <div
                class="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground"
              >
                {#if job.location}
                  <span>{job.location}</span>
                {/if}
                <span>{formatType(job.locationType)}</span>
                {#if job.salaryMin || job.salaryMax}
                  <span class="font-medium text-foreground"
                    >{formatSalary(job.salaryMin, job.salaryMax)}</span
                  >
                {/if}
              </div>
            </div>
            <div class="flex flex-col items-end gap-1.5">
              {#if job.matchScore > 0}
                <Badge
                  variant="outline"
                  size="xs"
                  class={job.matchScore >= 60
                    ? "border-success text-success"
                    : job.matchScore >= 40
                      ? "border-warning text-warning"
                      : "border-danger text-danger"}
                  >{job.matchScore}% match</Badge
                >
              {/if}
              <Badge variant="outline" size="xs"
                >{formatType(job.locationType)}</Badge
              >
              <Badge variant="outline" size="xs">{formatType(job.type)}</Badge>
            </div>
          </div>
          <div class="mt-3 flex flex-wrap gap-1.5">
            <Badge variant="secondary" size="xs">{job.seniority}</Badge>
            <Badge variant="secondary" size="xs">{job.category}</Badge>
            <Badge variant="outline" size="xs"
              >{LOCATION_LABELS[job.locationType] || job.locationType}</Badge
            >
            {#each job.skills.slice(0, 4) as skill}
              <Badge variant="outline" size="xs">{skill}</Badge>
            {/each}
            {#if job.skills.length > 4}
              <Badge variant="outline" size="xs">+{job.skills.length - 4}</Badge
              >
            {/if}
          </div>
          {#if job.matchScore > 0 && job.gaps.length > 0}
            <div
              class="mt-3 flex flex-wrap gap-1.5 border-t border-border pt-3"
            >
              <span class="mr-1 self-center text-xs text-muted-foreground"
                >Gaps:</span
              >
              {#each job.gaps as g}
                <Badge
                  variant="secondary"
                  size="xs"
                  class="bg-danger/10 text-danger border-danger/20">{g}</Badge
                >
              {/each}
            </div>
          {/if}
        </a>
      {/each}
    </div>

    {#if totalPages > 1}
      <div class="flex items-center justify-between pt-4">
        <p class="text-sm text-muted-foreground">
          Page {currentPage} of {totalPages}
        </p>
        <div class="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage <= 1}
            onclick={() => goToPage(currentPage - 1)}>Previous</Button
          >
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage >= totalPages}
            onclick={() => goToPage(currentPage + 1)}>Next</Button
          >
        </div>
      </div>
    {/if}
  {/if}
</div>
