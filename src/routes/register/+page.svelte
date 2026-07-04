<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import { Input } from "$lib/components/ui/input";
  import { Label } from "$lib/components/ui/label";
  let { form } = $props();
</script>

<div class="flex min-h-dvh items-center justify-center bg-background">
  <div class="w-full max-w-sm space-y-6 px-4">
    <div class="text-center">
      <h1 class="text-2xl font-bold text-foreground">Create account</h1>
      <p class="mt-1 text-sm text-muted-foreground">Start building your Living CV</p>
    </div>
    <form method="POST" class="space-y-4">
      {#if form?.error}
        <p class="text-sm text-destructive">{form.error}</p>
      {/if}
      <div>
        <Label for="name">Name</Label>
        <Input id="name" name="name" type="text" class="mt-1" />
      </div>
      <div>
        <Label for="email">Email</Label>
        <Input id="email" name="email" type="email" required class="mt-1" />
      </div>
      <div>
        <Label for="password">Password</Label>
        <Input id="password" name="password" type="password" required class="mt-1" />
      </div>
      <Button type="submit" class="w-full">Create account</Button>
    </form>
    <p class="text-center text-sm text-muted-foreground">
      Already have an account? <a href="/login" class="text-primary hover:underline">Sign in</a>
    </p>
  </div>
</div>
