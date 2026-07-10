<script lang="ts">
  import { Button } from "$lib/components/ui/button";

  let { data } = $props();
  let job = $state(data.job);
</script>

<div class="mx-auto max-w-2xl px-4 py-20 text-center">
  <div class="mx-auto mb-6 flex size-16 items-center justify-center rounded-full bg-success/10">
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-success"><path d="M20 6 9 17l-5-5"/></svg>
  </div>
  <h1 class="text-2xl font-bold text-foreground">Application submitted!</h1>
  <p class="mt-2 text-muted-foreground">
    Your application for <span class="font-medium text-foreground">{job.title}</span> at <span class="font-medium text-foreground">{job.company}</span> has been submitted.
  </p>
  <div class="mt-8 flex items-center justify-center gap-4">
    <a href="/jobs/{job.id}" class="inline-flex items-center justify-center rounded-lg bg-foreground px-5 py-2.5 text-sm font-medium text-background hover:bg-foreground/90">View job details</a>
    <a href="/jobs" class="inline-flex items-center justify-center rounded-lg border border-border px-5 py-2.5 text-sm font-medium text-foreground hover:bg-muted">Browse more jobs</a>
  </div>
</div>
