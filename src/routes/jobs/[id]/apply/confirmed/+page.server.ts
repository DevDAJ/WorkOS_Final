import { prisma } from "$lib/server";
import { getJob } from "$features/jobs/server";
import type { PageServerLoad } from "./$types";
import { error, redirect } from "@sveltejs/kit";

export const load: PageServerLoad = async ({ params, locals }) => {
  if (!locals.user) throw redirect(303, "/login");
  const [job, application] = await Promise.all([
    getJob(params.id),
    prisma.application.findUnique({
      where: { jobId_userId: { jobId: params.id, userId: locals.user.id } },
    }),
  ]);
  if (!job) throw error(404, "Job not found");
  if (!application) throw redirect(303, `/jobs/${params.id}`);
  return { job };
};
