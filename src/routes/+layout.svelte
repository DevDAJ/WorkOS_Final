<script lang="ts">
  import "../app.css";
  import { page } from "$app/stores";
  import { Button } from "$lib/components/ui/button";
  import ThemeToggle from "$lib/components/theme-toggle.svelte";

  let { data, children } = $props();
  let mobileOpen = $state(false);

  let user = $derived(data.user);
  let currentPath = $derived($page.url.pathname);

  function isActive(href: string) {
    if (href === "/") return currentPath === "/";
    return currentPath.startsWith(href);
  }

  const links = [
    { href: "/", label: "Home" },
    { href: "/living-cv", label: "Living CV" },
    { href: "/career-map", label: "Career Map" },
    { href: "/career-quest", label: "Career Quests" },
  ];
</script>

<div class="flex min-h-dvh flex-col bg-background text-foreground">
  <nav class="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
    <div class="mx-auto flex h-14 max-w-7xl items-center gap-2 px-4">
      <button
        onclick={() => mobileOpen = !mobileOpen}
        class="md:hidden -ml-2 flex size-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
        aria-label="Toggle menu"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          {#if mobileOpen}
            <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
          {:else}
            <path d="M4 12h16"/><path d="M4 6h16"/><path d="M4 18h16"/>
          {/if}
        </svg>
      </button>

      <a href="/" class="flex items-center gap-1.5 text-lg font-bold tracking-tight text-brand">
        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="text-brand">
          <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a2.5 2.5 0 0 1 0-5H20"/>
        </svg>
        CareerOS
      </a>

      <div class="hidden md:flex md:items-center md:gap-0.5">
        {#each links as link}
          <a
            href={link.href}
            class="rounded-lg px-3 py-1.5 text-sm font-medium transition-colors {isActive(link.href) ? 'bg-brand/10 text-brand' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}"
          >
            {link.label}
          </a>
        {/each}
      </div>

      <div class="flex-1"></div>

      <div class="flex items-center gap-1">
        <ThemeToggle />

        {#if user}
          <form method="POST" action="/api/logout">
            <Button type="submit" variant="ghost" size="sm" class="hidden md:inline-flex text-muted-foreground hover:text-destructive">
              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-1.5"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>
              Sign out
            </Button>
          </form>
        {:else}
          <a href="/login" class="hidden md:inline-flex text-sm font-medium text-muted-foreground hover:text-foreground">Sign in</a>
          <a href="/register" class="hidden md:inline-flex">
            <Button variant="default" size="sm">Get started</Button>
          </a>
        {/if}
      </div>
    </div>

    {#if mobileOpen}
      <!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
      <div class="border-t border-border md:hidden" onclick={() => mobileOpen = false} onkeydown={() => mobileOpen = false} role="menu" tabindex="0">
        <div class="mx-auto max-w-7xl px-4 py-3">
          <div class="flex flex-col gap-1">
            {#each links as link}
              <a
                href={link.href}
                class="rounded-lg px-3 py-2 text-sm font-medium transition-colors {isActive(link.href) ? 'bg-brand/10 text-brand' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}"
              >
                {link.label}
              </a>
            {/each}
          </div>

          <div class="mt-3 border-t border-border pt-3">
            {#if user}
              <div class="px-3 pb-2 text-xs text-muted-foreground">{user.email}</div>
              <form method="POST" action="/api/logout">
                <Button type="submit" variant="ghost" size="sm" class="w-full justify-start text-muted-foreground hover:text-destructive">
                  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>
                  Sign out
                </Button>
              </form>
            {:else}
              <a href="/login" class="flex rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground">Sign in</a>
              <a href="/register" class="mt-1 flex rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground">Create account</a>
            {/if}
          </div>
        </div>
      </div>
    {/if}
  </nav>

  <main class="flex-1">
    {@render children()}
  </main>
</div>
