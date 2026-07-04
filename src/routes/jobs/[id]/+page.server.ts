import { prisma } from "$lib/server";
import type { PageServerLoad, Actions } from "./$types";
import { error, redirect } from "@sveltejs/kit";
import { getJob, applyToJob, getApplicationStatus } from "$lib/server/jobs";

export const load: PageServerLoad = async ({ params, locals }) => {
  const job = await getJob(params.id);
  if (!job || job.status !== "ACTIVE") throw error(404, "Job not found");

  let application = null;
  let skillGaps: string[] = [];

  if (locals.user) {
    application = await getApplicationStatus(params.id, locals.user.id);

    const userSkills = await prisma.skill.findMany({
      where: { userId: locals.user.id },
      select: { name: true },
    });
    const userSkillNames = new Set(userSkills.map((s) => s.name.toLowerCase()));
    skillGaps = job.skills.filter((s) => !userSkillNames.has(s.toLowerCase()));
  }

  return { job, application, skillGaps };
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
        const evidence = (form.get(`evidence_${name}`) as string) || "";

        const skill = await prisma.skill.upsert({
          where: { userId_name: { userId: locals.user.id, name } },
          update: {},
          create: { userId: locals.user.id, name },
        });

        await prisma.skillEvidence
          .create({
            data: {
              skillId: skill.id,
              source: job.title,
              sourceId: params.id,
              confirmed: true,
            },
          })
          .catch(() => {});
      }
    }

    await applyToJob(params.id, locals.user.id, coverLetter || undefined);
  },
};
