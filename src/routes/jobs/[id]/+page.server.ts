import { prisma } from "$lib/server";
import type { PageServerLoad, Actions } from "./$types";
import { error, redirect } from "@sveltejs/kit";
import { getJob, getApplicationStatus, isCurrentlyStudying } from "$features/jobs/server";
import { extractJobKeywords } from "$lib/ai/job-keywords";

export const load: PageServerLoad = async ({ params, locals }) => {
  const job = await getJob(params.id);
  if (!job || job.status !== "ACTIVE") throw error(404, "Job not found");

  if (locals.user && job.type === "INTERN") {
    const studying = await isCurrentlyStudying(locals.user.id);
    if (!studying) {
      return { job, internshipBlocked: true as const, aiKeywords: [] as string[], application: null, skillGaps: [] as string[], strengths: [] as string[], matchScore: 0, resume: null };
    }
  }

  const aiKeywords = await extractJobKeywords({
    title: job.title,
    description: job.description,
    responsibilities: job.responsibilities,
    requirements: job.requirements,
    niceToHave: job.niceToHave,
  });

  const allSkills = [...new Set([...job.skills, ...aiKeywords])];

  let application = null;
  let skillGaps: string[] = [];

  if (locals.user) {
    application = await getApplicationStatus(params.id, locals.user.id);

    const resume = application
      ? await prisma.resume.findUnique({ where: { applicationId: application.id }, select: { id: true, style: true } })
      : null;

    const userSkills = await prisma.skill.findMany({ where: { userId: locals.user.id }, select: { name: true } });
    const userSkillNames = new Set(userSkills.map((s) => s.name.toLowerCase()));
    const matchedSkills = allSkills.filter((s) => userSkillNames.has(s.toLowerCase()));
    skillGaps = allSkills.filter((s) => !userSkillNames.has(s.toLowerCase()));
    const matchScore = allSkills.length > 0 ? Math.round((matchedSkills.length / allSkills.length) * 100) : 0;
    return { job, application, skillGaps, strengths: matchedSkills, matchScore, resume, aiKeywords, internshipBlocked: false as const };
  }

  return { job, application, skillGaps, strengths: [] as string[], matchScore: 0, resume: null, aiKeywords, internshipBlocked: false as const };
};

export const actions: Actions = {
  addSkill: async ({ params, locals, request }) => {
    if (!locals.user) throw redirect(303, "/login");
    const form = await request.formData();
    const name = form.get("name") as string;
    if (!name) return { existed: true };

    const existing = await prisma.skill.findUnique({
      where: { userId_name: { userId: locals.user.id, name } },
    });
    if (existing) return { existed: true };

    await prisma.skill.create({ data: { userId: locals.user.id, name } });
    return { existed: false, name };
  },
};
