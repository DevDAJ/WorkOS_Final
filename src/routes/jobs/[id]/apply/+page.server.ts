import { prisma } from "$lib/server";
import type { PageServerLoad } from "./$types";
import { error, redirect } from "@sveltejs/kit";
import { getJob, applyToJob, isCurrentlyStudying } from "$features/jobs/server";
import { extractJobKeywords } from "$lib/ai/job-keywords";
import { generateResumeHtml } from "$features/resume/server";

export const load: PageServerLoad = async ({ params, locals }) => {
  if (!locals.user) throw redirect(303, "/login");

  const job = await getJob(params.id);
  if (!job || job.status !== "ACTIVE") throw error(404, "Job not found");

  if (job.type === "INTERN") {
    const studying = await isCurrentlyStudying(locals.user.id);
    if (!studying) throw redirect(303, `/jobs/${params.id}`);
  }

  const existingApp = await prisma.application.findUnique({
    where: { jobId_userId: { jobId: params.id, userId: locals.user.id } },
  });
  if (existingApp && existingApp.status !== "WITHDRAWN") {
    throw redirect(303, `/jobs/${params.id}`);
  }

  const aiKeywords = await extractJobKeywords({
    title: job.title,
    description: job.description,
    responsibilities: job.responsibilities,
    requirements: job.requirements,
    niceToHave: job.niceToHave,
  });

  const allSkills = [...new Set([...job.skills, ...aiKeywords])];

  const [userSkills, workExps, userProjects] = await Promise.all([
    prisma.skill.findMany({ where: { userId: locals.user.id }, select: { name: true } }),
    prisma.workExperience.findMany({ where: { userId: locals.user.id }, select: { id: true, role: true, company: true } }),
    prisma.project.findMany({ where: { userId: locals.user.id }, select: { id: true, title: true } }),
  ]);
  const userSkillNames = new Set(userSkills.map((s) => s.name.toLowerCase()));
  const matchedSkills = allSkills.filter((s) => userSkillNames.has(s.toLowerCase()));
  const skillGaps = allSkills.filter((s) => !userSkillNames.has(s.toLowerCase()));
  const matchScore = allSkills.length > 0 ? Math.round((matchedSkills.length / allSkills.length) * 100) : 0;

  return { job, skillGaps, strengths: matchedSkills, matchScore, workExps, userProjects, aiKeywords };
};

export const actions = {
  default: async ({ params, locals, request }) => {
    if (!locals.user) throw redirect(303, "/login");

    const job = await getJob(params.id);
    if (!job) throw error(404, "Job not found");

    const form = await request.formData();
    const coverLetter = ((form.get("coverLetter") as string) || "").slice(0, 10000) || null;

    for (const key of form.keys()) {
      if (key.startsWith("claim_") && form.get(key) === "true") {
        const name = key.slice(6);
        const evidenceId = (form.get(`evidence_${name}`) as string) || "";
        if (!evidenceId) continue;

        const skill = await prisma.skill.upsert({
          where: { userId_name: { userId: locals.user.id, name } },
          update: {},
          create: { userId: locals.user.id, name },
        });

        let source = evidenceId;
        let sourceId = `${params.id}:${name}`;
        if (evidenceId.startsWith("work_")) {
          const we = await prisma.workExperience.findUnique({ where: { id: evidenceId.slice(5) } });
          if (we) { source = `${we.role} at ${we.company}`; sourceId = we.id; }
        } else if (evidenceId.startsWith("proj_")) {
          const proj = await prisma.project.findUnique({ where: { id: evidenceId.slice(5) } });
          if (proj) { source = proj.title; sourceId = proj.id; }
        }

        await prisma.skillEvidence.upsert({
          where: { skillId_source_sourceId: { skillId: skill.id, source, sourceId } },
          update: { confirmed: true },
          create: { skillId: skill.id, source, sourceId, confirmed: true },
        });
      }
    }

    const application = await applyToJob(params.id, locals.user.id, coverLetter || undefined);

    const resume = await generateResumeHtml(locals.user.id, params.id);
    if (resume) {
      await prisma.resume.upsert({
        where: { applicationId: application.id },
        update: { html: resume.html, style: resume.style },
        create: { applicationId: application.id, userId: locals.user.id, html: resume.html, style: resume.style },
      });
    }

    throw redirect(303, `/jobs/${params.id}/apply/confirmed`);
  },

  addSkill: async ({ locals, request }) => {
    if (!locals.user) throw redirect(303, "/login");
    const form = await request.formData();
    const name = form.get("name") as string;
    if (!name) return { existed: true };
    const existing = await prisma.skill.findUnique({ where: { userId_name: { userId: locals.user.id, name } } });
    if (existing) return { existed: true };
    await prisma.skill.create({ data: { userId: locals.user.id, name } });
    return { existed: false, name };
  },

  removeSkill: async ({ locals, request }) => {
    if (!locals.user) throw redirect(303, "/login");
    const form = await request.formData();
    const name = form.get("name") as string;
    if (!name) return {};
    await prisma.skill.deleteMany({ where: { userId: locals.user.id, name } });
    return { name };
  },
};
