import { prisma } from "$lib/server";
import type { PageServerLoad, Actions } from "./$types";
import { error, redirect } from "@sveltejs/kit";
import { getJob, applyToJob, getApplicationStatus } from "$features/jobs/server";
import { generateResumeHtml } from "$features/resume/server";

export const load: PageServerLoad = async ({ params, locals }) => {
  const job = await getJob(params.id);
  if (!job || job.status !== "ACTIVE") throw error(404, "Job not found");

  let application = null;
  let skillGaps: string[] = [];

  if (locals.user) {
    application = await getApplicationStatus(params.id, locals.user.id);

    const resume = application
      ? await prisma.resume.findUnique({ where: { applicationId: application.id }, select: { id: true, style: true } })
      : null;

    const [userSkills, workExps, userProjects] = await Promise.all([
      prisma.skill.findMany({ where: { userId: locals.user.id }, select: { name: true } }),
      prisma.workExperience.findMany({ where: { userId: locals.user.id }, select: { id: true, role: true, company: true } }),
      prisma.project.findMany({ where: { userId: locals.user.id }, select: { id: true, title: true } }),
    ]);
    const userSkillNames = new Set(userSkills.map((s) => s.name.toLowerCase()));
    const matchedSkills = job.skills.filter((s) => userSkillNames.has(s.toLowerCase()));
    skillGaps = job.skills.filter((s) => !userSkillNames.has(s.toLowerCase()));
    const matchScore = job.skills.length > 0 ? Math.round((matchedSkills.length / job.skills.length) * 100) : 0;
    return { job, application, skillGaps, strengths: matchedSkills, matchScore, resume, workExps, userProjects };
  }

  return { job, application, skillGaps, strengths: [] as string[], matchScore: 0, resume: null, workExps: [], userProjects: [] };
};

export const actions: Actions = {
  apply: async ({ params, locals, request }) => {
    if (!locals.user) throw redirect(303, "/login");

    const job = await getJob(params.id);
    if (!job) throw error(404, "Job not found");

    const form = await request.formData();
    const coverLetter = form.get("coverLetter") as string | null;

    for (const key of form.keys()) {
      if (key.startsWith("claim_") && form.get(key) === "true") {
        const name = key.slice(6);
        const evidenceId = (form.get(`evidence_${name}`) as string) || "";

        const skill = await prisma.skill.upsert({
          where: { userId_name: { userId: locals.user.id, name } },
          update: {},
          create: { userId: locals.user.id, name },
        });

        let source = job.title;
        let sourceId = params.id;
        if (evidenceId.startsWith("work_")) {
          const we = await prisma.workExperience.findUnique({ where: { id: evidenceId.slice(5) } });
          if (we) { source = `${we.role} at ${we.company}`; sourceId = we.id; }
        } else if (evidenceId.startsWith("proj_")) {
          const proj = await prisma.project.findUnique({ where: { id: evidenceId.slice(5) } });
          if (proj) { source = proj.title; sourceId = proj.id; }
        }

        await prisma.skillEvidence
          .create({
            data: { skillId: skill.id, source, sourceId, confirmed: true },
          })
          .catch(() => {});
      }
    }

    const application = await applyToJob(params.id, locals.user.id, coverLetter || undefined);

    const resume = await generateResumeHtml(locals.user.id, params.id);
    if (resume) {
      await prisma.resume.upsert({
        where: { applicationId: application.id },
        update: { html: resume.html, style: resume.style },
        create: {
          applicationId: application.id,
          userId: locals.user.id,
          html: resume.html,
          style: resume.style,
        },
      });
    }
  },
};
