import { prisma } from "$lib/server";
import { redirect } from "@sveltejs/kit";
import { getUserApplications, withdrawApplication, updateApplication } from "$features/jobs/server";
import type { PageServerLoad, Actions } from "./$types";

export const load: PageServerLoad = async ({ locals }) => {
  if (!locals.user) redirect(302, "/login");

  const [apps, userSkills] = await Promise.all([
    getUserApplications(locals.user.id),
    prisma.skill.findMany({
      where: { userId: locals.user.id },
      select: { name: true },
    }),
  ]);

  const userSkillNames = new Set(userSkills.map((s) => s.name.toLowerCase()));

  const appIds = apps.map((a) => a.id);
  const resumes = appIds.length
    ? await prisma.resume.findMany({ where: { applicationId: { in: appIds } }, select: { id: true, style: true, applicationId: true } })
    : [];
  const resumeMap = new Map(resumes.map((r) => [r.applicationId, r]));

  const applications = apps.map((app) => {
    const jobSkills = app.job.skills.map((s) => s.toLowerCase());
    const matchedSkills = jobSkills.filter((s) => userSkillNames.has(s));
    const matchScore = jobSkills.length > 0 ? Math.round((matchedSkills.length / jobSkills.length) * 100) : 0;
    const resumeInfo = resumeMap.get(app.id) || null;
    return { ...app, matchScore, resume: resumeInfo };
  });

  return { applications };
};

export const actions: Actions = {
  withdraw: async ({ locals, request }) => {
    if (!locals.user) throw redirect(303, "/login");
    const form = await request.formData();
    const jobId = form.get("jobId") as string;
    if (!jobId) return;
    await withdrawApplication(jobId, locals.user.id);
  },
  edit: async ({ locals, request }) => {
    if (!locals.user) throw redirect(303, "/login");
    const form = await request.formData();
    const jobId = form.get("jobId") as string;
    const coverLetter = form.get("coverLetter") as string | null;
    if (!jobId) return;
    await updateApplication(jobId, locals.user.id, { coverLetter: coverLetter || null });
  },
  reapply: async ({ locals, request }) => {
    if (!locals.user) throw redirect(303, "/login");
    const form = await request.formData();
    const jobId = form.get("jobId") as string;
    if (!jobId) return;
    await updateApplication(jobId, locals.user.id, { status: "PENDING" });
  },
};
