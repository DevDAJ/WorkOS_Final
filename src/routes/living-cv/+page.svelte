<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import { Input } from "$lib/components/ui/input";
  import { Label } from "$lib/components/ui/label";
  import { Textarea } from "$lib/components/ui/textarea";
  import * as Card from "$lib/components/ui/card";

  let { data } = $props();
  let cv = $state(data.cv);
  let user = $state({ name: data.user.name || "", image: data.user.image || "" });

  let personalInfo = $state({ ...cv.personalInfo || {} });
  let saving = $state(false);

  function toDateInput(d: Date | string | null | undefined): string {
    if (!d) return "";
    return new Date(d).toISOString().split("T")[0];
  }

  async function savePersonalInfo() {
    saving = true;
    const form = new FormData();
    form.append("data", JSON.stringify(personalInfo));
    await fetch("?/savePersonalInfo", { method: "POST", body: form });
    saving = false;
  }

  // --- Education ---
  let showEducationForm = $state(false);
  let editingEducationId = $state<string | null>(null);
  let newEducation = $state({ institution: "", degree: "", field: "", startDate: "", endDate: "", gpa: "", description: "" });
  let editEducation = $state({ institution: "", degree: "", field: "", startDate: "", endDate: "", gpa: "", description: "" });

  function startEditEducation(item: any) {
    editingEducationId = item.id;
    editEducation = {
      institution: item.institution || "",
      degree: item.degree || "",
      field: item.field || "",
      startDate: toDateInput(item.startDate),
      endDate: toDateInput(item.endDate),
      gpa: item.gpa?.toString() || "",
      description: item.description || "",
    };
  }

  // --- Work Experience ---
  let showWorkForm = $state(false);
  let editingWorkId = $state<string | null>(null);
  let newWork = $state({ company: "", role: "", location: "", startDate: "", endDate: "", current: false, description: "" });
  let editWork = $state({ company: "", role: "", location: "", startDate: "", endDate: "", current: false, description: "" });

  function startEditWork(item: any) {
    editingWorkId = item.id;
    editWork = {
      company: item.company || "",
      role: item.role || "",
      location: item.location || "",
      startDate: toDateInput(item.startDate),
      endDate: toDateInput(item.endDate),
      current: item.current || false,
      description: item.description || "",
    };
  }

  // --- Project ---
  let showProjectForm = $state(false);
  let editingProjectId = $state<string | null>(null);
  let newProject = $state({
    title: "", description: "", role: "", teamSize: 0, duration: "",
    status: "", repoUrl: "", demoUrl: "", technologies: "", skillsDemonstrated: "",
    responsibilities: "", featuresBuilt: "", challenges: "", lessonsLearned: "", tags: ""
  });
  let editProject = $state({
    id: "", title: "", description: "", role: "", teamSize: 0, duration: "",
    status: "", repoUrl: "", demoUrl: "", technologies: "", skillsDemonstrated: "",
    responsibilities: "", featuresBuilt: "", challenges: "", lessonsLearned: "", tags: ""
  });

  function startEditProject(item: any) {
    editingProjectId = item.id;
    editProject = {
      id: item.id,
      title: item.title || "",
      description: item.description || "",
      role: item.role || "",
      teamSize: item.teamSize || 0,
      duration: item.duration || "",
      status: item.status || "",
      repoUrl: item.repoUrl || "",
      demoUrl: item.demoUrl || "",
      technologies: item.technologies?.join(", ") || "",
      skillsDemonstrated: item.skillsDemonstrated?.join(", ") || "",
      responsibilities: item.responsibilities?.join("\n") || "",
      featuresBuilt: item.featuresBuilt?.join("\n") || "",
      challenges: item.challenges || "",
      lessonsLearned: item.lessonsLearned || "",
      tags: item.tags?.join(", ") || "",
    };
  }

  // --- Certification ---
  let showCertForm = $state(false);
  let editingCertId = $state<string | null>(null);
  let newCert = $state({ name: "", issuer: "", date: "", url: "", description: "" });
  let editCert = $state({ id: "", name: "", issuer: "", date: "", url: "", description: "" });

  function startEditCert(item: any) {
    editingCertId = item.id;
    editCert = { id: item.id, name: item.name || "", issuer: item.issuer || "", date: toDateInput(item.date), url: item.url || "", description: item.description || "" };
  }

  // --- Award ---
  let showAwardForm = $state(false);
  let editingAwardId = $state<string | null>(null);
  let newAward = $state({ name: "", issuer: "", date: "", description: "" });
  let editAward = $state({ id: "", name: "", issuer: "", date: "", description: "" });

  function startEditAward(item: any) {
    editingAwardId = item.id;
    editAward = { id: item.id, name: item.name || "", issuer: item.issuer || "", date: toDateInput(item.date), description: item.description || "" };
  }

  // --- Language ---
  let showLangForm = $state(false);
  let editingLangId = $state<string | null>(null);
  let newLang = $state({ name: "", proficiency: "INTERMEDIATE" });
  let editLang = $state({ id: "", name: "", proficiency: "INTERMEDIATE" });

  function startEditLang(item: any) {
    editingLangId = item.id;
    editLang = { id: item.id, name: item.name || "", proficiency: item.proficiency || "INTERMEDIATE" };
  }

  // --- Reference ---
  let showRefForm = $state(false);
  let editingRefId = $state<string | null>(null);
  let newRef = $state({ name: "", email: "", phone: "", company: "", role: "", relationship: "" });
  let editRef = $state({ id: "", name: "", email: "", phone: "", company: "", role: "", relationship: "" });

  function startEditRef(item: any) {
    editingRefId = item.id;
    editRef = { id: item.id, name: item.name || "", email: item.email || "", phone: item.phone || "", company: item.company || "", role: item.role || "", relationship: item.relationship || "" };
  }

  // --- Social Link ---
  let showSocialForm = $state(false);
  let editingSocialId = $state<string | null>(null);
  let newSocial = $state({ platform: "", url: "" });
  let editSocial = $state({ id: "", platform: "", url: "" });

  function startEditSocial(item: any) {
    editingSocialId = item.id;
    editSocial = { id: item.id, platform: item.platform || "", url: item.url || "" };
  }
</script>

<div class="mx-auto max-w-4xl px-4 py-8">
  <header class="mb-8">
    <h1 class="text-3xl font-bold text-foreground">Living CV</h1>
    <p class="mt-1 text-muted-foreground">Your single source of truth</p>
  </header>

  <div class="space-y-6">
    <!-- Profile -->
    <Card.Root>
      <Card.Header>
        <Card.Title>Profile</Card.Title>
        <Card.Description>Your account name and photo</Card.Description>
      </Card.Header>
      <Card.Content>
        <form method="POST" action="?/updateUser" class="space-y-4">
          <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div class="space-y-2">
              <Label>Name</Label>
              <Input name="name" bind:value={user.name} placeholder="Your full name" />
            </div>
            <div class="space-y-2">
              <Label>Image URL</Label>
              <Input name="image" bind:value={user.image} placeholder="https://..." />
            </div>
          </div>
          <Button type="submit">Save Profile</Button>
        </form>
      </Card.Content>
    </Card.Root>

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
          <Button variant="outline" type="button" onclick={() => { showEducationForm = !showEducationForm; editingEducationId = null; }}>
            {showEducationForm ? "Cancel" : "Add Education"}
          </Button>
        </div>
      </Card.Header>
      <Card.Content>
        {#if showEducationForm}
          <form method="POST" action="?/addEducation" class="mb-6 space-y-4 rounded-lg border border-border p-4">
            <input type="hidden" name="data" value={JSON.stringify({
              institution: newEducation.institution,
              degree: newEducation.degree,
              field: newEducation.field,
              startDate: newEducation.startDate || undefined,
              endDate: newEducation.endDate || undefined,
              gpa: newEducation.gpa ? parseFloat(newEducation.gpa) : undefined,
              description: newEducation.description || undefined,
            })} />
            <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div class="space-y-2">
                <Label>Institution</Label>
                <Input bind:value={newEducation.institution} placeholder="University name" required />
              </div>
              <div class="space-y-2">
                <Label>Degree</Label>
                <Input bind:value={newEducation.degree} placeholder="e.g. Bachelor of Science" required />
              </div>
              <div class="space-y-2">
                <Label>Field of Study</Label>
                <Input bind:value={newEducation.field} placeholder="e.g. Computer Science" required />
              </div>
              <div class="space-y-2">
                <Label>GPA</Label>
                <Input bind:value={newEducation.gpa} placeholder="e.g. 3.8" />
              </div>
              <div class="space-y-2">
                <Label>Start Date</Label>
                <Input type="date" bind:value={newEducation.startDate} />
              </div>
              <div class="space-y-2">
                <Label>End Date</Label>
                <Input type="date" bind:value={newEducation.endDate} />
              </div>
              <div class="space-y-2 md:col-span-2">
                <Label>Description</Label>
                <Textarea bind:value={newEducation.description} class="min-h-[60px]" placeholder="Add details..." />
              </div>
            </div>
            <Button type="submit">Save Education</Button>
          </form>
        {/if}

        {#if cv.education.length === 0}
          <p class="text-sm text-muted-foreground">No education added yet.</p>
        {:else}
          <div class="space-y-4">
            {#each cv.education as edu}
              {#if editingEducationId === edu.id}
                <form method="POST" action="?/updateEducation" class="space-y-4 rounded-lg border border-border p-4">
                  <input type="hidden" name="data" value={JSON.stringify({
                    id: edu.id,
                    institution: editEducation.institution,
                    degree: editEducation.degree,
                    field: editEducation.field,
                    startDate: editEducation.startDate || undefined,
                    endDate: editEducation.endDate || undefined,
                    gpa: editEducation.gpa ? parseFloat(editEducation.gpa) : undefined,
                    description: editEducation.description || undefined,
                  })} />
                  <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div class="space-y-2">
                      <Label>Institution</Label>
                      <Input bind:value={editEducation.institution} placeholder="University name" required />
                    </div>
                    <div class="space-y-2">
                      <Label>Degree</Label>
                      <Input bind:value={editEducation.degree} placeholder="e.g. Bachelor of Science" required />
                    </div>
                    <div class="space-y-2">
                      <Label>Field of Study</Label>
                      <Input bind:value={editEducation.field} placeholder="e.g. Computer Science" required />
                    </div>
                    <div class="space-y-2">
                      <Label>GPA</Label>
                      <Input bind:value={editEducation.gpa} placeholder="e.g. 3.8" />
                    </div>
                    <div class="space-y-2">
                      <Label>Start Date</Label>
                      <Input type="date" bind:value={editEducation.startDate} />
                    </div>
                    <div class="space-y-2">
                      <Label>End Date</Label>
                      <Input type="date" bind:value={editEducation.endDate} />
                    </div>
                    <div class="space-y-2 md:col-span-2">
                      <Label>Description</Label>
                      <Textarea bind:value={editEducation.description} class="min-h-[60px]" placeholder="Add details..." />
                    </div>
                  </div>
                  <div class="flex gap-2">
                    <Button type="submit">Save</Button>
                    <Button variant="ghost" type="button" onclick={() => editingEducationId = null}>Cancel</Button>
                  </div>
                </form>
              {:else}
                <div class="flex items-start justify-between rounded-lg border p-4">
                  <div>
                    <p class="font-medium text-foreground">{edu.degree} in {edu.field}</p>
                    <p class="text-sm text-muted-foreground">{edu.institution}</p>
                    <p class="text-xs text-muted-foreground">{new Date(edu.startDate).toLocaleDateString()} - {edu.endDate ? new Date(edu.endDate).toLocaleDateString() : "Present"}</p>
                    {#if edu.description}<p class="mt-1 text-xs text-muted-foreground">{edu.description}</p>{/if}
                  </div>
                  <div class="flex gap-1">
                    <Button variant="ghost" size="sm" type="button" onclick={() => startEditEducation(edu)}>Edit</Button>
                    <form method="POST" action="?/deleteEducation">
                      <input type="hidden" name="id" value={edu.id} />
                      <Button variant="ghost" size="sm" type="submit">Delete</Button>
                    </form>
                  </div>
                </div>
              {/if}
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
          <Button variant="outline" type="button" onclick={() => { showWorkForm = !showWorkForm; editingWorkId = null; }}>
            {showWorkForm ? "Cancel" : "Add Experience"}
          </Button>
        </div>
      </Card.Header>
      <Card.Content>
        {#if showWorkForm}
          <form method="POST" action="?/addWorkExperience" class="mb-6 space-y-4 rounded-lg border border-border p-4">
            <input type="hidden" name="data" value={JSON.stringify({
              company: newWork.company,
              role: newWork.role,
              location: newWork.location || undefined,
              startDate: newWork.startDate || undefined,
              endDate: newWork.current ? undefined : (newWork.endDate || undefined),
              current: newWork.current || undefined,
              description: newWork.description || undefined,
            })} />
            <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div class="space-y-2">
                <Label>Company</Label>
                <Input bind:value={newWork.company} placeholder="Company name" required />
              </div>
              <div class="space-y-2">
                <Label>Role</Label>
                <Input bind:value={newWork.role} placeholder="e.g. Software Engineer" required />
              </div>
              <div class="space-y-2">
                <Label>Location</Label>
                <Input bind:value={newWork.location} placeholder="San Francisco, CA" />
              </div>
              <div class="space-y-2">
                <Label>Start Date</Label>
                <Input type="date" bind:value={newWork.startDate} />
              </div>
              <div class="space-y-2">
                <Label>End Date</Label>
                <Input type="date" bind:value={newWork.endDate} disabled={newWork.current} />
              </div>
              <div class="flex items-end space-x-2 pb-2">
                <input type="checkbox" id="newWorkCurrent" bind:checked={newWork.current} class="h-4 w-4 rounded border-border" />
                <Label for="newWorkCurrent">I currently work here</Label>
              </div>
              <div class="space-y-2 md:col-span-2">
                <Label>Description</Label>
                <Textarea bind:value={newWork.description} class="min-h-[60px]" placeholder="Describe your role and achievements..." />
              </div>
            </div>
            <Button type="submit">Save Experience</Button>
          </form>
        {/if}

        {#if cv.workExperience.length === 0}
          <p class="text-sm text-muted-foreground">No work experience added yet.</p>
        {:else}
          <div class="space-y-4">
            {#each cv.workExperience as exp}
              {#if editingWorkId === exp.id}
                <form method="POST" action="?/updateWorkExperience" class="space-y-4 rounded-lg border border-border p-4">
                  <input type="hidden" name="data" value={JSON.stringify({
                    id: exp.id,
                    company: editWork.company,
                    role: editWork.role,
                    location: editWork.location || undefined,
                    startDate: editWork.startDate || undefined,
                    endDate: editWork.current ? undefined : (editWork.endDate || undefined),
                    current: editWork.current || undefined,
                    description: editWork.description || undefined,
                  })} />
                  <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div class="space-y-2">
                      <Label>Company</Label>
                      <Input bind:value={editWork.company} placeholder="Company name" required />
                    </div>
                    <div class="space-y-2">
                      <Label>Role</Label>
                      <Input bind:value={editWork.role} placeholder="e.g. Software Engineer" required />
                    </div>
                    <div class="space-y-2">
                      <Label>Location</Label>
                      <Input bind:value={editWork.location} placeholder="San Francisco, CA" />
                    </div>
                    <div class="space-y-2">
                      <Label>Start Date</Label>
                      <Input type="date" bind:value={editWork.startDate} />
                    </div>
                    <div class="space-y-2">
                      <Label>End Date</Label>
                      <Input type="date" bind:value={editWork.endDate} disabled={editWork.current} />
                    </div>
                    <div class="flex items-end space-x-2 pb-2">
                      <input type="checkbox" id="editWorkCurrent" bind:checked={editWork.current} class="h-4 w-4 rounded border-border" />
                      <Label for="editWorkCurrent">I currently work here</Label>
                    </div>
                    <div class="space-y-2 md:col-span-2">
                      <Label>Description</Label>
                      <Textarea bind:value={editWork.description} class="min-h-[60px]" placeholder="Describe your role and achievements..." />
                    </div>
                  </div>
                  <div class="flex gap-2">
                    <Button type="submit">Save</Button>
                    <Button variant="ghost" type="button" onclick={() => editingWorkId = null}>Cancel</Button>
                  </div>
                </form>
              {:else}
                <div class="flex items-start justify-between rounded-lg border p-4">
                  <div>
                    <p class="font-medium text-foreground">{exp.role} at {exp.company}</p>
                    <p class="text-sm text-muted-foreground">{exp.location}</p>
                    <p class="text-xs text-muted-foreground">{new Date(exp.startDate).toLocaleDateString()} - {exp.endDate ? new Date(exp.endDate).toLocaleDateString() : "Present"}</p>
                    {#if exp.description}<p class="mt-1 text-xs text-muted-foreground">{exp.description}</p>{/if}
                  </div>
                  <div class="flex gap-1">
                    <Button variant="ghost" size="sm" type="button" onclick={() => startEditWork(exp)}>Edit</Button>
                    <form method="POST" action="?/deleteWorkExperience">
                      <input type="hidden" name="id" value={exp.id} />
                      <Button variant="ghost" size="sm" type="submit">Delete</Button>
                    </form>
                  </div>
                </div>
              {/if}
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
          <Button variant="outline" type="button" onclick={() => { showProjectForm = !showProjectForm; editingProjectId = null; }}>
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
              {#if editingProjectId === proj.id}
                <form method="POST" action="?/updateProject" class="space-y-4 rounded-lg border border-border p-4">
                  <input type="hidden" name="data" value={JSON.stringify({
                    id: editProject.id,
                    title: editProject.title,
                    description: editProject.description || undefined,
                    role: editProject.role || undefined,
                    teamSize: editProject.teamSize || undefined,
                    duration: editProject.duration || undefined,
                    status: editProject.status || undefined,
                    repoUrl: editProject.repoUrl || undefined,
                    demoUrl: editProject.demoUrl || undefined,
                    technologies: editProject.technologies ? editProject.technologies.split(",").map(s => s.trim()).filter(Boolean) : undefined,
                    skillsDemonstrated: editProject.skillsDemonstrated ? editProject.skillsDemonstrated.split(",").map(s => s.trim()).filter(Boolean) : undefined,
                    responsibilities: editProject.responsibilities ? editProject.responsibilities.split("\n").filter(Boolean) : undefined,
                    featuresBuilt: editProject.featuresBuilt ? editProject.featuresBuilt.split("\n").filter(Boolean) : undefined,
                    challenges: editProject.challenges || undefined,
                    lessonsLearned: editProject.lessonsLearned || undefined,
                    tags: editProject.tags ? editProject.tags.split(",").map(s => s.trim()).filter(Boolean) : undefined,
                  })} />
                  <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div class="space-y-2 md:col-span-2">
                      <Label>Title</Label>
                      <Input bind:value={editProject.title} placeholder="Project name" required />
                    </div>
                    <div class="space-y-2">
                      <Label>Role</Label>
                      <Input bind:value={editProject.role} placeholder="e.g. Lead Developer" />
                    </div>
                    <div class="space-y-2">
                      <Label>Duration</Label>
                      <Input bind:value={editProject.duration} placeholder="e.g. 3 months" />
                    </div>
                    <div class="space-y-2">
                      <Label>Team Size</Label>
                      <Input type="number" bind:value={editProject.teamSize} placeholder="e.g. 4" />
                    </div>
                    <div class="space-y-2">
                      <Label>Status</Label>
                      <Input bind:value={editProject.status} placeholder="e.g. Completed" />
                    </div>
                    <div class="space-y-2 md:col-span-2">
                      <Label>Description</Label>
                      <Textarea bind:value={editProject.description} class="min-h-[80px]" placeholder="Project description" />
                    </div>
                    <div class="space-y-2 md:col-span-2">
                      <Label>Technologies (comma separated)</Label>
                      <Input bind:value={editProject.technologies} placeholder="React, TypeScript, Tailwind" />
                    </div>
                    <div class="space-y-2 md:col-span-2">
                      <Label>Skills Demonstrated (comma separated)</Label>
                      <Input bind:value={editProject.skillsDemonstrated} placeholder="System Design, API Development" />
                    </div>
                    <div class="space-y-2">
                      <Label>Repo URL</Label>
                      <Input bind:value={editProject.repoUrl} placeholder="https://github.com/..." />
                    </div>
                    <div class="space-y-2">
                      <Label>Demo URL</Label>
                      <Input bind:value={editProject.demoUrl} placeholder="https://..." />
                    </div>
                  </div>
                  <div class="flex gap-2">
                    <Button type="submit">Save</Button>
                    <Button variant="ghost" type="button" onclick={() => editingProjectId = null}>Cancel</Button>
                  </div>
                </form>
              {:else}
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
                  <div class="flex gap-1">
                    <Button variant="ghost" size="sm" type="button" onclick={() => startEditProject(proj)}>Edit</Button>
                    <form method="POST" action="?/deleteProject">
                      <input type="hidden" name="id" value={proj.id} />
                      <Button variant="ghost" size="sm" type="submit">Delete</Button>
                    </form>
                  </div>
                </div>
              {/if}
            {/each}
          </div>
        {/if}
      </Card.Content>
    </Card.Root>

    <!-- Certifications -->
    <Card.Root>
      <Card.Header>
        <div class="flex items-center justify-between">
          <div>
            <Card.Title>Certifications</Card.Title>
            <Card.Description>Professional certifications and credentials</Card.Description>
          </div>
          <Button variant="outline" type="button" onclick={() => { showCertForm = !showCertForm; editingCertId = null; }}>
            {showCertForm ? "Cancel" : "Add Certification"}
          </Button>
        </div>
      </Card.Header>
      <Card.Content>
        {#if showCertForm}
          <form method="POST" action="?/addCertification" class="mb-6 space-y-4 rounded-lg border border-border p-4">
            <input type="hidden" name="data" value={JSON.stringify({
              name: newCert.name,
              issuer: newCert.issuer,
              date: newCert.date || undefined,
              url: newCert.url || undefined,
              description: newCert.description || undefined,
            })} />
            <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div class="space-y-2">
                <Label>Name</Label>
                <Input bind:value={newCert.name} placeholder="e.g. AWS Solutions Architect" required />
              </div>
              <div class="space-y-2">
                <Label>Issuer</Label>
                <Input bind:value={newCert.issuer} placeholder="e.g. Amazon Web Services" required />
              </div>
              <div class="space-y-2">
                <Label>Date</Label>
                <Input type="date" bind:value={newCert.date} />
              </div>
              <div class="space-y-2">
                <Label>URL</Label>
                <Input bind:value={newCert.url} placeholder="https://..." />
              </div>
              <div class="space-y-2 md:col-span-2">
                <Label>Description</Label>
                <Textarea bind:value={newCert.description} class="min-h-[60px]" placeholder="Additional details..." />
              </div>
            </div>
            <Button type="submit">Save Certification</Button>
          </form>
        {/if}

        {#if cv.certifications.length === 0}
          <p class="text-sm text-muted-foreground">No certifications added yet.</p>
        {:else}
          <div class="space-y-4">
            {#each cv.certifications as cert}
              {#if editingCertId === cert.id}
                <form method="POST" action="?/updateCertification" class="space-y-4 rounded-lg border border-border p-4">
                  <input type="hidden" name="data" value={JSON.stringify({
                    id: editCert.id,
                    name: editCert.name,
                    issuer: editCert.issuer,
                    date: editCert.date || undefined,
                    url: editCert.url || undefined,
                    description: editCert.description || undefined,
                  })} />
                  <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div class="space-y-2"><Label>Name</Label><Input bind:value={editCert.name} required /></div>
                    <div class="space-y-2"><Label>Issuer</Label><Input bind:value={editCert.issuer} required /></div>
                    <div class="space-y-2"><Label>Date</Label><Input type="date" bind:value={editCert.date} /></div>
                    <div class="space-y-2"><Label>URL</Label><Input bind:value={editCert.url} /></div>
                    <div class="space-y-2 md:col-span-2"><Label>Description</Label><Textarea bind:value={editCert.description} class="min-h-[60px]" /></div>
                  </div>
                  <div class="flex gap-2">
                    <Button type="submit">Save</Button>
                    <Button variant="ghost" type="button" onclick={() => editingCertId = null}>Cancel</Button>
                  </div>
                </form>
              {:else}
                <div class="flex items-start justify-between rounded-lg border p-4">
                  <div>
                    <p class="font-medium text-foreground">{cert.name}</p>
                    <p class="text-sm text-muted-foreground">{cert.issuer}{cert.date ? ` - ${new Date(cert.date).toLocaleDateString()}` : ""}</p>
                    {#if cert.description}<p class="text-xs text-muted-foreground mt-1">{cert.description}</p>{/if}
                  </div>
                  <div class="flex gap-1">
                    <Button variant="ghost" size="sm" type="button" onclick={() => startEditCert(cert)}>Edit</Button>
                    <form method="POST" action="?/deleteCertification">
                      <input type="hidden" name="id" value={cert.id} />
                      <Button variant="ghost" size="sm" type="submit">Delete</Button>
                    </form>
                  </div>
                </div>
              {/if}
            {/each}
          </div>
        {/if}
      </Card.Content>
    </Card.Root>

    <!-- Awards -->
    <Card.Root>
      <Card.Header>
        <div class="flex items-center justify-between">
          <div>
            <Card.Title>Awards</Card.Title>
            <Card.Description>Awards and recognition</Card.Description>
          </div>
          <Button variant="outline" type="button" onclick={() => { showAwardForm = !showAwardForm; editingAwardId = null; }}>
            {showAwardForm ? "Cancel" : "Add Award"}
          </Button>
        </div>
      </Card.Header>
      <Card.Content>
        {#if showAwardForm}
          <form method="POST" action="?/addAward" class="mb-6 space-y-4 rounded-lg border border-border p-4">
            <input type="hidden" name="data" value={JSON.stringify({
              name: newAward.name,
              issuer: newAward.issuer || undefined,
              date: newAward.date || undefined,
              description: newAward.description || undefined,
            })} />
            <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div class="space-y-2">
                <Label>Name</Label>
                <Input bind:value={newAward.name} placeholder="e.g. Employee of the Month" required />
              </div>
              <div class="space-y-2">
                <Label>Issuer</Label>
                <Input bind:value={newAward.issuer} placeholder="e.g. Company Name" />
              </div>
              <div class="space-y-2">
                <Label>Date</Label>
                <Input type="date" bind:value={newAward.date} />
              </div>
              <div class="space-y-2 md:col-span-2">
                <Label>Description</Label>
                <Textarea bind:value={newAward.description} class="min-h-[60px]" placeholder="What was this award for?" />
              </div>
            </div>
            <Button type="submit">Save Award</Button>
          </form>
        {/if}

        {#if cv.awards.length === 0}
          <p class="text-sm text-muted-foreground">No awards added yet.</p>
        {:else}
          <div class="space-y-4">
            {#each cv.awards as award}
              {#if editingAwardId === award.id}
                <form method="POST" action="?/updateAward" class="space-y-4 rounded-lg border border-border p-4">
                  <input type="hidden" name="data" value={JSON.stringify({
                    id: editAward.id, name: editAward.name, issuer: editAward.issuer || undefined,
                    date: editAward.date || undefined, description: editAward.description || undefined,
                  })} />
                  <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div class="space-y-2"><Label>Name</Label><Input bind:value={editAward.name} required /></div>
                    <div class="space-y-2"><Label>Issuer</Label><Input bind:value={editAward.issuer} /></div>
                    <div class="space-y-2"><Label>Date</Label><Input type="date" bind:value={editAward.date} /></div>
                    <div class="space-y-2 md:col-span-2"><Label>Description</Label><Textarea bind:value={editAward.description} class="min-h-[60px]" /></div>
                  </div>
                  <div class="flex gap-2">
                    <Button type="submit">Save</Button>
                    <Button variant="ghost" type="button" onclick={() => editingAwardId = null}>Cancel</Button>
                  </div>
                </form>
              {:else}
                <div class="flex items-start justify-between rounded-lg border p-4">
                  <div>
                    <p class="font-medium text-foreground">{award.name}</p>
                    {#if award.issuer}<p class="text-sm text-muted-foreground">{award.issuer}</p>{/if}
                    {#if award.date}<p class="text-xs text-muted-foreground">{new Date(award.date).toLocaleDateString()}</p>{/if}
                    {#if award.description}<p class="text-xs text-muted-foreground mt-1">{award.description}</p>{/if}
                  </div>
                  <div class="flex gap-1">
                    <Button variant="ghost" size="sm" type="button" onclick={() => startEditAward(award)}>Edit</Button>
                    <form method="POST" action="?/deleteAward">
                      <input type="hidden" name="id" value={award.id} />
                      <Button variant="ghost" size="sm" type="submit">Delete</Button>
                    </form>
                  </div>
                </div>
              {/if}
            {/each}
          </div>
        {/if}
      </Card.Content>
    </Card.Root>

    <!-- Languages -->
    <Card.Root>
      <Card.Header>
        <div class="flex items-center justify-between">
          <div>
            <Card.Title>Languages</Card.Title>
            <Card.Description>Languages you speak</Card.Description>
          </div>
          <Button variant="outline" type="button" onclick={() => { showLangForm = !showLangForm; editingLangId = null; }}>
            {showLangForm ? "Cancel" : "Add Language"}
          </Button>
        </div>
      </Card.Header>
      <Card.Content>
        {#if showLangForm}
          <form method="POST" action="?/addLanguage" class="mb-6 space-y-4 rounded-lg border border-border p-4">
            <input type="hidden" name="data" value={JSON.stringify({ name: newLang.name, proficiency: newLang.proficiency })} />
            <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div class="space-y-2">
                <Label>Language</Label>
                <Input bind:value={newLang.name} placeholder="e.g. English" required />
              </div>
              <div class="space-y-2">
                <Label>Proficiency</Label>
                <select bind:value={newLang.proficiency} class="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm">
                  <option value="BEGINNER">Beginner</option>
                  <option value="INTERMEDIATE">Intermediate</option>
                  <option value="ADVANCED">Advanced</option>
                  <option value="NATIVE">Native</option>
                </select>
              </div>
            </div>
            <Button type="submit">Save Language</Button>
          </form>
        {/if}

        {#if cv.languages.length === 0}
          <p class="text-sm text-muted-foreground">No languages added yet.</p>
        {:else}
          <div class="space-y-4">
            {#each cv.languages as lang}
              {#if editingLangId === lang.id}
                <form method="POST" action="?/updateLanguage" class="space-y-4 rounded-lg border border-border p-4">
                  <input type="hidden" name="data" value={JSON.stringify({ id: editLang.id, name: editLang.name, proficiency: editLang.proficiency })} />
                  <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div class="space-y-2"><Label>Language</Label><Input bind:value={editLang.name} required /></div>
                    <div class="space-y-2">
                      <Label>Proficiency</Label>
                      <select bind:value={editLang.proficiency} class="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm">
                        <option value="BEGINNER">Beginner</option>
                        <option value="INTERMEDIATE">Intermediate</option>
                        <option value="ADVANCED">Advanced</option>
                        <option value="NATIVE">Native</option>
                      </select>
                    </div>
                  </div>
                  <div class="flex gap-2">
                    <Button type="submit">Save</Button>
                    <Button variant="ghost" type="button" onclick={() => editingLangId = null}>Cancel</Button>
                  </div>
                </form>
              {:else}
                <div class="flex items-start justify-between rounded-lg border p-4">
                  <div>
                    <p class="font-medium text-foreground">{lang.name}</p>
                    <p class="text-sm text-muted-foreground">{lang.proficiency.toLowerCase()}</p>
                  </div>
                  <div class="flex gap-1">
                    <Button variant="ghost" size="sm" type="button" onclick={() => startEditLang(lang)}>Edit</Button>
                    <form method="POST" action="?/deleteLanguage">
                      <input type="hidden" name="id" value={lang.id} />
                      <Button variant="ghost" size="sm" type="submit">Delete</Button>
                    </form>
                  </div>
                </div>
              {/if}
            {/each}
          </div>
        {/if}
      </Card.Content>
    </Card.Root>

    <!-- References -->
    <Card.Root>
      <Card.Header>
        <div class="flex items-center justify-between">
          <div>
            <Card.Title>References</Card.Title>
            <Card.Description>Professional references</Card.Description>
          </div>
          <Button variant="outline" type="button" onclick={() => { showRefForm = !showRefForm; editingRefId = null; }}>
            {showRefForm ? "Cancel" : "Add Reference"}
          </Button>
        </div>
      </Card.Header>
      <Card.Content>
        {#if showRefForm}
          <form method="POST" action="?/addReference" class="mb-6 space-y-4 rounded-lg border border-border p-4">
            <input type="hidden" name="data" value={JSON.stringify({
              name: newRef.name, email: newRef.email || undefined, phone: newRef.phone || undefined,
              company: newRef.company || undefined, role: newRef.role || undefined,
              relationship: newRef.relationship || undefined,
            })} />
            <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div class="space-y-2">
                <Label>Name</Label>
                <Input bind:value={newRef.name} placeholder="Reference name" required />
              </div>
              <div class="space-y-2">
                <Label>Email</Label>
                <Input bind:value={newRef.email} placeholder="email@example.com" />
              </div>
              <div class="space-y-2">
                <Label>Phone</Label>
                <Input bind:value={newRef.phone} placeholder="+1 (555) 123-4567" />
              </div>
              <div class="space-y-2">
                <Label>Company</Label>
                <Input bind:value={newRef.company} placeholder="Company name" />
              </div>
              <div class="space-y-2">
                <Label>Role</Label>
                <Input bind:value={newRef.role} placeholder="e.g. Engineering Manager" />
              </div>
              <div class="space-y-2">
                <Label>Relationship</Label>
                <Input bind:value={newRef.relationship} placeholder="e.g. Former Manager" />
              </div>
            </div>
            <Button type="submit">Save Reference</Button>
          </form>
        {/if}

        {#if cv.references.length === 0}
          <p class="text-sm text-muted-foreground">No references added yet.</p>
        {:else}
          <div class="space-y-4">
            {#each cv.references as ref}
              {#if editingRefId === ref.id}
                <form method="POST" action="?/updateReference" class="space-y-4 rounded-lg border border-border p-4">
                  <input type="hidden" name="data" value={JSON.stringify({
                    id: editRef.id, name: editRef.name, email: editRef.email || undefined,
                    phone: editRef.phone || undefined, company: editRef.company || undefined,
                    role: editRef.role || undefined, relationship: editRef.relationship || undefined,
                  })} />
                  <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div class="space-y-2"><Label>Name</Label><Input bind:value={editRef.name} required /></div>
                    <div class="space-y-2"><Label>Email</Label><Input bind:value={editRef.email} /></div>
                    <div class="space-y-2"><Label>Phone</Label><Input bind:value={editRef.phone} /></div>
                    <div class="space-y-2"><Label>Company</Label><Input bind:value={editRef.company} /></div>
                    <div class="space-y-2"><Label>Role</Label><Input bind:value={editRef.role} /></div>
                    <div class="space-y-2"><Label>Relationship</Label><Input bind:value={editRef.relationship} /></div>
                  </div>
                  <div class="flex gap-2">
                    <Button type="submit">Save</Button>
                    <Button variant="ghost" type="button" onclick={() => editingRefId = null}>Cancel</Button>
                  </div>
                </form>
              {:else}
                <div class="flex items-start justify-between rounded-lg border p-4">
                  <div>
                    <p class="font-medium text-foreground">{ref.name}</p>
                    {#if ref.role || ref.company}<p class="text-sm text-muted-foreground">{ref.role}{ref.role && ref.company ? " at " : ""}{ref.company}</p>{/if}
                    {#if ref.email || ref.phone}<p class="text-xs text-muted-foreground">{ref.email}{ref.email && ref.phone ? " - " : ""}{ref.phone}</p>{/if}
                    {#if ref.relationship}<p class="text-xs text-muted-foreground">{ref.relationship}</p>{/if}
                  </div>
                  <div class="flex gap-1">
                    <Button variant="ghost" size="sm" type="button" onclick={() => startEditRef(ref)}>Edit</Button>
                    <form method="POST" action="?/deleteReference">
                      <input type="hidden" name="id" value={ref.id} />
                      <Button variant="ghost" size="sm" type="submit">Delete</Button>
                    </form>
                  </div>
                </div>
              {/if}
            {/each}
          </div>
        {/if}
      </Card.Content>
    </Card.Root>

    <!-- Social Links -->
    <Card.Root>
      <Card.Header>
        <div class="flex items-center justify-between">
          <div>
            <Card.Title>Social Links</Card.Title>
            <Card.Description>Your online presence</Card.Description>
          </div>
          <Button variant="outline" type="button" onclick={() => { showSocialForm = !showSocialForm; editingSocialId = null; }}>
            {showSocialForm ? "Cancel" : "Add Link"}
          </Button>
        </div>
      </Card.Header>
      <Card.Content>
        {#if showSocialForm}
          <form method="POST" action="?/addSocialLink" class="mb-6 space-y-4 rounded-lg border border-border p-4">
            <input type="hidden" name="data" value={JSON.stringify({ platform: newSocial.platform, url: newSocial.url })} />
            <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div class="space-y-2">
                <Label>Platform</Label>
                <Input bind:value={newSocial.platform} placeholder="e.g. GitHub, LinkedIn" required />
              </div>
              <div class="space-y-2">
                <Label>URL</Label>
                <Input bind:value={newSocial.url} placeholder="https://..." required />
              </div>
            </div>
            <Button type="submit">Save Link</Button>
          </form>
        {/if}

        {#if cv.socialLinks.length === 0}
          <p class="text-sm text-muted-foreground">No social links added yet.</p>
        {:else}
          <div class="space-y-4">
            {#each cv.socialLinks as link}
              {#if editingSocialId === link.id}
                <form method="POST" action="?/updateSocialLink" class="space-y-4 rounded-lg border border-border p-4">
                  <input type="hidden" name="data" value={JSON.stringify({ id: editSocial.id, platform: editSocial.platform, url: editSocial.url })} />
                  <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div class="space-y-2"><Label>Platform</Label><Input bind:value={editSocial.platform} required /></div>
                    <div class="space-y-2"><Label>URL</Label><Input bind:value={editSocial.url} required /></div>
                  </div>
                  <div class="flex gap-2">
                    <Button type="submit">Save</Button>
                    <Button variant="ghost" type="button" onclick={() => editingSocialId = null}>Cancel</Button>
                  </div>
                </form>
              {:else}
                <div class="flex items-start justify-between rounded-lg border p-4">
                  <div>
                    <p class="font-medium text-foreground">{link.platform}</p>
                    <a href={link.url} target="_blank" rel="noopener noreferrer" class="text-sm text-muted-foreground hover:text-foreground hover:underline">{link.url}</a>
                  </div>
                  <div class="flex gap-1">
                    <Button variant="ghost" size="sm" type="button" onclick={() => startEditSocial(link)}>Edit</Button>
                    <form method="POST" action="?/deleteSocialLink">
                      <input type="hidden" name="id" value={link.id} />
                      <Button variant="ghost" size="sm" type="submit">Delete</Button>
                    </form>
                  </div>
                </div>
              {/if}
            {/each}
          </div>
        {/if}
      </Card.Content>
    </Card.Root>
  </div>
</div>
