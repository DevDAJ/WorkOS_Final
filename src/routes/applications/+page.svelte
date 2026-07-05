<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import { Badge } from "$lib/components/ui/badge";
  import { enhance } from "$app/forms";

  let { data } = $props();
  let applications = $derived(data.applications);

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

  function scoreColor(score: number): string {
    if (score >= 60) return "border-success text-success";
    if (score >= 40) return "border-warning text-warning";
    return "border-danger text-danger";
  }

  function formatDate(d: Date): string {
    return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  }

  let editing = $state<string | null>(null);
  let editCoverLetter = $state("");

  function toggleEdit(jobId: string, current: string | null) {
    if (editing === jobId) { editing = null; return; }
    editing = jobId;
    editCoverLetter = current || "";
  }
</script>

<div class="mx-auto max-w-4xl px-4 py-8">
  <header class="mb-8">
    <h1 class="text-2xl font-bold text-foreground sm:text-3xl">My Applications</h1>
    <p class="mt-1 text-sm text-muted-foreground">{applications.length} application{applications.length === 1 ? "" : "s"}</p>
  </header>

  {#if applications.length === 0}
    <div class="flex flex-col items-center gap-2 py-20 text-center">
      <p class="text-lg font-medium text-foreground">No applications yet</p>
      <p class="text-sm text-muted-foreground">Browse jobs and apply to get started.</p>
      <a href="/"><Button variant="default" class="mt-2">Browse jobs</Button></a>
    </div>
  {:else}
    <div class="space-y-4">
      {#each applications as app}
        <div class="rounded-xl border border-border bg-card">
          <div class="flex items-start justify-between gap-3 p-4 sm:p-5">
            <div class="flex min-w-0 items-center gap-3">
              <div class="flex size-10 shrink-0 items-center justify-center rounded-lg bg-brand/10 text-base font-bold text-brand">
                {app.job.company.charAt(0)}
              </div>
              <div class="min-w-0">
                <a href="/jobs/{app.jobId}" class="truncate text-sm font-semibold text-foreground hover:text-brand">{app.job.title}</a>
                <p class="text-xs text-muted-foreground">{app.job.company}</p>
              </div>
            </div>
            <div class="flex shrink-0 items-center gap-2">
              <Badge variant="outline" size="xs" class={scoreColor(app.matchScore)}>{app.matchScore}%</Badge>
              <Badge variant={statusVariant[app.status] || "outline"} size="xs">
                {statusLabel[app.status] || app.status}
              </Badge>
            </div>
          </div>

          <div class="flex items-center justify-between border-t border-border px-4 py-3 sm:px-5">
            <span class="text-xs text-muted-foreground">
              Applied {formatDate(app.createdAt)}
              {#if app.updatedAt && app.updatedAt !== app.createdAt}
                &middot; Updated {formatDate(app.updatedAt)}
              {/if}
            </span>
            <div class="flex gap-2">
              {#if app.status === "WITHDRAWN"}
                <form method="POST" use:enhance>
                  <input type="hidden" name="jobId" value={app.jobId} />
                  <Button type="submit" formaction="?/reapply" variant="outline" size="sm">Re-apply</Button>
                </form>
              {:else}
                <form method="POST" use:enhance>
                  <input type="hidden" name="jobId" value={app.jobId} />
                  <Button type="submit" formaction="?/withdraw" variant="outline" size="sm" class="text-destructive border-destructive/30 hover:bg-destructive/10">Cancel</Button>
                </form>
              {/if}
              <Button variant="outline" size="sm" onclick={() => toggleEdit(app.jobId, app.coverLetter)}>{editing === app.jobId ? "Close" : "Edit"}</Button>
            </div>
          </div>

          {#if editing === app.jobId}
            <form method="POST" use:enhance action="?/edit" class="border-t border-border px-4 py-4 sm:px-5">
              <input type="hidden" name="jobId" value={app.jobId} />
              <label for="cover-{app.jobId}" class="text-xs font-medium text-foreground">Cover Letter</label>
              <textarea
                id="cover-{app.jobId}"
                bind:value={editCoverLetter}
                name="coverLetter"
                class="border-input focus-visible:border-ring focus-visible:ring-ring/50 mt-1.5 w-full rounded-lg border bg-transparent px-3 py-2 text-sm outline-none focus-visible:ring-3"
                rows="4"
                placeholder="Write a cover letter..."
              ></textarea>
              <div class="mt-3 flex justify-end gap-2">
                <Button type="submit" size="sm">Save</Button>
              </div>
            </form>
          {/if}
        </div>
      {/each}
    </div>
  {/if}
</div>
