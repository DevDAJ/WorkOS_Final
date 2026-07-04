<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import { Input } from "$lib/components/ui/input";
  import { Label } from "$lib/components/ui/label";
  import * as Card from "$lib/components/ui/card";

  let { data, form } = $props();
  let { demoUsers } = $state(data);
</script>

<div class="flex min-h-dvh items-center justify-center bg-background px-4 py-12">
  <div class="w-full max-w-sm space-y-8">
    <div class="text-center">
      <h1 class="text-2xl font-bold text-foreground">Sign in</h1>
      <p class="mt-1 text-sm text-muted-foreground">Welcome back to LivingCV</p>
    </div>

    <form method="POST" action="?/login" class="space-y-4">
      {#if form?.error}
        <p class="text-sm text-destructive">{form.error}</p>
      {/if}
      <div>
        <Label for="email">Email</Label>
        <Input id="email" name="email" type="email" required class="mt-1" />
      </div>
      <div>
        <Label for="password">Password</Label>
        <Input id="password" name="password" type="password" required class="mt-1" />
      </div>
      <Button type="submit" class="w-full">Sign in</Button>
    </form>

    <div class="relative">
      <div class="absolute inset-0 flex items-center">
        <span class="w-full border-t border-border"></span>
      </div>
      <div class="relative flex justify-center text-xs uppercase">
        <span class="bg-background px-2 text-muted-foreground">Quick demo access</span>
      </div>
    </div>

    <div class="space-y-2">
      {#each demoUsers as user}
        <form method="POST" action="?/quickLogin">
          <input type="hidden" name="userId" value={user.id} />
          <button type="submit" class="flex w-full cursor-pointer items-center gap-3 rounded-xl border border-border bg-card p-3 text-left transition-all hover:border-brand/50 hover:shadow-sm focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none">
            <div class="flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand/10 text-sm font-bold text-brand">
              {user.name ? user.name.charAt(0).toUpperCase() : "?"}
            </div>
            <div class="min-w-0 flex-1">
              <p class="text-sm font-medium text-foreground">{user.name}</p>
              <p class="truncate text-xs text-muted-foreground">{user.title || user.email}</p>
            </div>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="shrink-0 text-brand"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" x2="3" y1="12" y2="12"/></svg>
          </button>
        </form>
      {/each}
    </div>

    <p class="text-center text-xs text-muted-foreground">
      Password for all demo accounts: <code class="rounded bg-muted px-1 py-0.5 font-mono text-xs">password123</code>
    </p>

    <p class="text-center text-sm text-muted-foreground">
      No account? <a href="/register" class="text-primary hover:underline">Register</a>
    </p>
  </div>
</div>
