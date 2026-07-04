<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import { Input } from "$lib/components/ui/input";
  import { Label } from "$lib/components/ui/label";
  import { Textarea } from "$lib/components/ui/textarea";
  import * as Card from "$lib/components/ui/card";

  let { data } = $props();
  let cv = $state(data.cv);


  let personalInfo = $state({ ...cv.personalInfo || {} });
  let saving = $state(false);

  async function savePersonalInfo() {
    saving = true;
    const form = new FormData();
    form.append("data", JSON.stringify(personalInfo));
    await fetch("?/savePersonalInfo", { method: "POST", body: form });
    saving = false;
  }
</script>

<div class="mx-auto max-w-4xl px-4 py-8">
  <header class="mb-8">
    <h1 class="text-3xl font-bold text-foreground">Living CV</h1>
    <p class="mt-1 text-muted-foreground">Your single source of truth</p>
  </header>

  <div class="space-y-6">
    <!-- Personal Info -->
    <Card.Root>
      <Card.Header>
        <Card.Title>Personal Information</Card.Title>
        <Card.Description>Your basic contact and profile details</Card.Description>
      </Card.Header>
      <Card.Content class="space-y-4">
        <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div class="space-y-2">
            <Label>Title</Label>
            <Input bind:value={personalInfo.title} placeholder="e.g. Senior Software Engineer" />
          </div>
          <div class="space-y-2">
            <Label>Headline</Label>
            <Input bind:value={personalInfo.headline} placeholder="e.g. Full-stack developer with 5 years experience" />
          </div>
          <div class="space-y-2">
            <Label>Phone</Label>
            <Input bind:value={personalInfo.phone} placeholder="+1 (555) 123-4567" />
          </div>
          <div class="space-y-2">
            <Label>Location</Label>
            <Input bind:value={personalInfo.location} placeholder="San Francisco, CA" />
          </div>
          <div class="space-y-2 md:col-span-2">
            <Label>Website</Label>
            <Input bind:value={personalInfo.website} placeholder="https://yourwebsite.com" />
          </div>
          <div class="space-y-2 md:col-span-2">
            <Label>Summary</Label>
            <Textarea bind:value={personalInfo.summary} class="min-h-[100px]" placeholder="Write a brief summary about yourself..." />
          </div>
        </div>
        <Button onclick={savePersonalInfo} disabled={saving}>
          {saving ? "Saving..." : "Save"}
        </Button>
      </Card.Content>
    </Card.Root>

    <!-- Education -->
    <Card.Root>
      <Card.Header>
        <div class="flex items-center justify-between">
          <div>
            <Card.Title>Education</Card.Title>
            <Card.Description>Your academic background</Card.Description>
          </div>
          <Button variant="outline" type="button">Add Education</Button>
        </div>
      </Card.Header>
      <Card.Content>
        {#if cv.education.length === 0}
          <p class="text-sm text-muted-foreground">No education added yet.</p>
        {:else}
          <div class="space-y-4">
            {#each cv.education as edu}
              <div class="flex items-start justify-between rounded-lg border p-4">
                <div>
                  <p class="font-medium text-foreground">{edu.degree} in {edu.field}</p>
                  <p class="text-sm text-muted-foreground">{edu.institution}</p>
                  <p class="text-xs text-muted-foreground">{new Date(edu.startDate).toLocaleDateString()} - {edu.endDate ? new Date(edu.endDate).toLocaleDateString() : "Present"}</p>
                </div>
                <form method="POST" action="?/deleteEducation">
                  <input type="hidden" name="id" value={edu.id} />
                  <Button variant="ghost" size="sm" type="submit">Delete</Button>
                </form>
              </div>
            {/each}
          </div>
        {/if}
      </Card.Content>
    </Card.Root>

    <!-- Work Experience -->
    <Card.Root>
      <Card.Header>
        <div class="flex items-center justify-between">
          <div>
            <Card.Title>Work Experience</Card.Title>
            <Card.Description>Your professional career</Card.Description>
          </div>
          <Button variant="outline" type="button">Add Experience</Button>
        </div>
      </Card.Header>
      <Card.Content>
        {#if cv.workExperience.length === 0}
          <p class="text-sm text-muted-foreground">No work experience added yet.</p>
        {:else}
          <div class="space-y-4">
            {#each cv.workExperience as exp}
              <div class="flex items-start justify-between rounded-lg border p-4">
                <div>
                  <p class="font-medium text-foreground">{exp.role} at {exp.company}</p>
                  <p class="text-sm text-muted-foreground">{exp.location}</p>
                  <p class="text-xs text-muted-foreground">{new Date(exp.startDate).toLocaleDateString()} - {exp.endDate ? new Date(exp.endDate).toLocaleDateString() : "Present"}</p>
                </div>
                <form method="POST" action="?/deleteWorkExperience">
                  <input type="hidden" name="id" value={exp.id} />
                  <Button variant="ghost" size="sm" type="submit">Delete</Button>
                </form>
              </div>
            {/each}
          </div>
        {/if}
      </Card.Content>
    </Card.Root>
  </div>
</div>
