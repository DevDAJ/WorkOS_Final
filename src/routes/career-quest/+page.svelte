<script lang="ts">
  import * as Card from "$lib/components/ui/card";
  import { Button } from "$lib/components/ui/button";
  import { Badge } from "$lib/components/ui/badge";

  let { data } = $props();

  interface TaskData {
    id: string;
    description: string;
    skillName: string | null;
    status: string;
  }

  interface QuestData {
    quests: Array<{
      id: string;
      title: string;
      description: string | null;
      progress: number;
      status: string;
      roleId: string;
      tasks: TaskData[];
      role?: { name: string; category: string };
    }>;
    user: { id: string };
  }

  let questData = $state(data as QuestData);

  let aiUpgradeError = $state(false);
  let aiUpgrading = $state(
    questData.quests[0]?.tasks.some((t) => t.description.startsWith("Learn and demonstrate")) ?? false
  );

  $effect(() => {
    const q = questData.quests[0];
    if (!q) { aiUpgrading = false; return; }
    if (!q.tasks.some((t) => t.description.startsWith("Learn and demonstrate"))) {
      aiUpgrading = false;
      return;
    }
    const ctrl = new AbortController();
    fetch(`/api/ai/career-quest?questId=${q.id}`, { signal: ctrl.signal })
      .then((r) => r.json())
      .then((upgraded) => {
        if (upgraded?.tasks) {
          questData.quests = questData.quests.map((x) =>
            x.id === upgraded.id ? { ...x, tasks: upgraded.tasks } : x
          );
        }
        aiUpgrading = false;
      })
      .catch(() => { aiUpgradeError = true; aiUpgrading = false; });
    return () => ctrl.abort();
  });
</script>

<div class="mx-auto max-w-4xl px-4 py-8">
  <header class="mb-8">
    <h1 class="text-3xl font-bold text-foreground">Career Quests</h1>
    <p class="mt-1 text-muted-foreground">Complete quests to unlock new roles</p>
  </header>

  {#if questData.quests.length === 0}
    <Card.Root>
      <Card.Content class="py-12 text-center">
        <p class="text-muted-foreground">No active quests.</p>
        <p class="mt-1 text-sm text-muted-foreground">Go to the <a href="/career-map" class="underline">Career Map</a> to find roles to pursue.</p>
      </Card.Content>
    </Card.Root>
  {/if}

  {#each questData.quests as quest}
    <Card.Root class="mb-4">
      <Card.Header>
        <div class="flex items-start justify-between">
          <div>
            <Card.Title>{quest.title}</Card.Title>
            {#if quest.role}
              <Card.Description>
                <Badge variant="outline">{quest.role.category}</Badge>
              </Card.Description>
            {/if}
            {#if quest.description}
              <p class="mt-1 text-sm text-muted-foreground">{quest.description}</p>
            {/if}
          </div>
          <Badge variant={quest.status === "ACTIVE" ? "default" : "secondary"}>
            {quest.status}
          </Badge>
        </div>
      </Card.Header>
      <Card.Content>
        <div class="mb-4">
          <div class="flex items-center justify-between text-sm">
            <span class="text-muted-foreground">Progress</span>
            <span class="font-medium">{Math.round(quest.progress)}%</span>
          </div>
          <div class="mt-1 h-2 w-full rounded-full bg-muted">
            <div
              class="h-2 rounded-full bg-primary transition-all"
              style="width: {quest.progress}%"
            ></div>
          </div>
        </div>

        {#if aiUpgrading}
          <div class="flex flex-col gap-2">
            {#each [1, 2, 3] as _}
              <div class="h-10 animate-pulse rounded-lg bg-muted"></div>
            {/each}
          </div>
        {:else}
          {#if aiUpgradeError}
            <p class="mb-2 text-sm text-danger">Could not personalize tasks.</p>
          {/if}
          {#if quest.tasks.length}
            <div class="flex flex-col gap-2">
              {#each quest.tasks as task}
                <div class="flex items-center justify-between rounded-lg border px-3 py-2 text-sm">
                  <div class="flex items-center gap-2">
                    <span class="size-2 rounded-full {task.status === 'COMPLETED' ? 'bg-success' : 'bg-warning'}"></span>
                    <span class={task.status === "COMPLETED" ? "text-muted-foreground line-through" : "text-foreground"}>
                      {task.description}
                      {#if task.skillName}
                        <Badge variant="outline" size="xs" class="ml-1">{task.skillName}</Badge>
                      {/if}
                    </span>
                  </div>
                  {#if task.status !== "COMPLETED"}
                    <form method="POST" action="?/completeTask">
                      <input type="hidden" name="questId" value={quest.id} />
                      <input type="hidden" name="taskId" value={task.id} />
                      <Button type="submit" size="xs">Complete</Button>
                    </form>
                  {/if}
                </div>
              {/each}
            </div>
          {:else}
            <p class="text-sm text-muted-foreground">No tasks yet.</p>
          {/if}
        {/if}
      </Card.Content>
    </Card.Root>
  {/each}
</div>
