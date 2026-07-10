<script lang="ts">
  import JobCard from "$features/jobs/job-card.svelte";
  import { Input } from "$lib/components/ui/input";
  import { Button } from "$lib/components/ui/button";

  let { data, form } = $props();
  let { jobs, total } = $state(data);

  const PAGE_SIZE = 10;
  let currentPage = $state(1);
  let totalPages = $derived(Math.ceil(total / PAGE_SIZE));
  let paginatedJobs = $derived(jobs.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE));

  $effect(() => {
    jobs;
    currentPage = 1;
  });

  function goToPage(p: number) {
    currentPage = p;
  }

  let search = $state(data.search ?? "");
  let category = $state(data.category ?? "");
  let seniority = $state(data.seniority ?? "");

  const CATEGORIES = ["DESIGN", "FRONTEND", "BACKEND", "FULLSTACK", "MOBILE", "DATA", "ML", "QA", "PM", "DEVOPS", "SRE", "SECURITY", "OTHER"];
  const SENIORITIES = ["INTERN", "JUNIOR", "MID", "SENIOR", "STAFF", "PRINCIPAL"];
  const LOCATION_TYPES = ["ON_SITE", "REMOTE", "HYBRID"];
</script>

<div class="mx-auto max-w-6xl px-4 py-8">
  <div class="mb-8">
    <h1 class="text-3xl font-bold text-foreground">Jobs</h1>
    <p class="mt-1 text-sm text-muted-foreground">{total} open positions</p>
  </div>

  <form method="GET" class="mb-6 space-y-4" action="/jobs">
    <div class="flex flex-wrap gap-3">
      <Input
        name="search"
        placeholder="Search by title, company, or keyword..."
        class="min-w-[240px] flex-1"
        bind:value={search}
      />
      <select
        name="category"
        class="border-input rounded-lg border bg-transparent px-3 py-2 text-sm outline-none focus:border-ring"
        bind:value={category}
      >
        <option value="">All categories</option>
        {#each CATEGORIES as c}
          <option value={c}>{c}</option>
        {/each}
      </select>
      <select
        name="seniority"
        class="border-input rounded-lg border bg-transparent px-3 py-2 text-sm outline-none focus:border-ring"
        bind:value={seniority}
      >
        <option value="">All levels</option>
        {#each SENIORITIES as s}
          <option value={s}>{s}</option>
        {/each}
      </select>
      <Button type="submit" variant="default">Search</Button>
    </div>
  </form>

  {#if jobs.length === 0}
    <div class="rounded-xl border border-border bg-card p-12 text-center">
      <p class="text-lg font-medium text-foreground">No jobs found</p>
      <p class="mt-1 text-sm text-muted-foreground">Try adjusting your search or filters.</p>
    </div>
  {:else}
    <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {#each paginatedJobs as job}
        <JobCard {job} />
      {/each}
    </div>

    {#if totalPages > 1}
      <div class="mt-8 flex items-center justify-between">
        <p class="text-sm text-muted-foreground">Page {currentPage} of {totalPages}</p>
        <div class="flex items-center gap-2">
          <Button variant="outline" size="sm" disabled={currentPage <= 1} onclick={() => goToPage(currentPage - 1)}>Previous</Button>
          <Button variant="outline" size="sm" disabled={currentPage >= totalPages} onclick={() => goToPage(currentPage + 1)}>Next</Button>
        </div>
      </div>
    {/if}
  {/if}
</div>
