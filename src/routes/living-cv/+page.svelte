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
  let showProjectForm = $state(false);
  let newProject = $state({
    title: "", description: "", role: "", teamSize: 0, duration: "",
    status: "", repoUrl: "", demoUrl: "", technologies: "", skillsDemonstrated: "",
    responsibilities: "", featuresBuilt: "", challenges: "", lessonsLearned: "", tags: ""
  });

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

    <!-- Projects -->
    <Card.Root>
      <Card.Header>
        <div class="flex items-center justify-between">
          <div>
            <Card.Title>Projects</Card.Title>
            <Card.Description>Side projects, open source, and portfolio work</Card.Description>
          </div>
          <Button variant="outline" type="button" onclick={() => showProjectForm = !showProjectForm}>
            {showProjectForm ? "Cancel" : "Add Project"}
          </Button>
        </div>
      </Card.Header>
      <Card.Content>
        {#if showProjectForm}
          <form method="POST" action="?/addProject" class="mb-6 space-y-4 rounded-lg border border-border p-4">
            <input type="hidden" name="data" value={JSON.stringify({
              title: newProject.title,
              description: newProject.description || undefined,
              role: newProject.role || undefined,
              teamSize: newProject.teamSize || undefined,
              duration: newProject.duration || undefined,
              status: newProject.status || undefined,
              repoUrl: newProject.repoUrl || undefined,
              demoUrl: newProject.demoUrl || undefined,
              technologies: newProject.technologies ? newProject.technologies.split(",").map(s => s.trim()).filter(Boolean) : undefined,
              skillsDemonstrated: newProject.skillsDemonstrated ? newProject.skillsDemonstrated.split(",").map(s => s.trim()).filter(Boolean) : undefined,
              responsibilities: newProject.responsibilities ? newProject.responsibilities.split("\n").filter(Boolean) : undefined,
              featuresBuilt: newProject.featuresBuilt ? newProject.featuresBuilt.split("\n").filter(Boolean) : undefined,
              challenges: newProject.challenges || undefined,
              lessonsLearned: newProject.lessonsLearned || undefined,
              tags: newProject.tags ? newProject.tags.split(",").map(s => s.trim()).filter(Boolean) : undefined,
            })} />
            <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div class="space-y-2 md:col-span-2">
                <Label>Title</Label>
                <Input bind:value={newProject.title} placeholder="Project name" required />
              </div>
              <div class="space-y-2">
                <Label>Role</Label>
                <Input bind:value={newProject.role} placeholder="e.g. Lead Developer" />
              </div>
              <div class="space-y-2">
                <Label>Duration</Label>
                <Input bind:value={newProject.duration} placeholder="e.g. 3 months" />
              </div>
              <div class="space-y-2">
                <Label>Team Size</Label>
                <Input type="number" bind:value={newProject.teamSize} placeholder="e.g. 4" />
              </div>
              <div class="space-y-2">
                <Label>Status</Label>
                <Input bind:value={newProject.status} placeholder="e.g. Completed" />
              </div>
              <div class="space-y-2 md:col-span-2">
                <Label>Description</Label>
                <Textarea bind:value={newProject.description} class="min-h-[80px]" placeholder="Project description" />
              </div>
              <div class="space-y-2 md:col-span-2">
                <Label>Technologies (comma separated)</Label>
                <Input bind:value={newProject.technologies} placeholder="React, TypeScript, Tailwind" />
              </div>
              <div class="space-y-2 md:col-span-2">
                <Label>Skills Demonstrated (comma separated)</Label>
                <Input bind:value={newProject.skillsDemonstrated} placeholder="System Design, API Development" />
              </div>
              <div class="space-y-2">
                <Label>Repo URL</Label>
                <Input bind:value={newProject.repoUrl} placeholder="https://github.com/..." />
              </div>
              <div class="space-y-2">
                <Label>Demo URL</Label>
                <Input bind:value={newProject.demoUrl} placeholder="https://..." />
              </div>
            </div>
            <Button type="submit">Save Project</Button>
          </form>
        {/if}

        {#if cv.projects.length === 0}
          <p class="text-sm text-muted-foreground">No projects added yet.</p>
        {:else}
          <div class="space-y-4">
            {#each cv.projects as proj}
              <div class="flex items-start justify-between rounded-lg border p-4">
                <div class="min-w-0 flex-1">
                  <p class="font-medium text-foreground">{proj.title}</p>
                  {#if proj.role}<p class="text-sm text-muted-foreground">{proj.role}</p>{/if}
                  <div class="mt-1 flex flex-wrap gap-1.5">
                    {#each proj.technologies as tech}
                      <span class="rounded-md bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">{tech}</span>
                    {/each}
                  </div>
                  {#if proj.description}
                    <p class="mt-2 text-xs text-muted-foreground line-clamp-2">{proj.description}</p>
                  {/if}
                </div>
                <form method="POST" action="?/deleteProject">
                  <input type="hidden" name="id" value={proj.id} />
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
