import { redirect } from "@sveltejs/kit";
import { prisma } from "$lib/server";
import { getCareerMap } from "$features/career-map/server";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals }) => {
  if (!locals.user) redirect(302, "/login");

  const currentJob = await prisma.workExperience.findFirst({
    where: { userId: locals.user.id, current: true },
    select: { role: true },
  });

  const data = await getCareerMap(locals.user.id, currentJob?.role);
  return data;
};
