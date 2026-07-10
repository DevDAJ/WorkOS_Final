import { seedJobsOnce, getJobs } from "$features/jobs/server";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ url, locals }) => {
  await seedJobsOnce();

  const search = url.searchParams.get("search") || "";
  const category = url.searchParams.get("category") || "";
  const seniority = url.searchParams.get("seniority") || "";
  const locationType = url.searchParams.get("locationType") || undefined;
  const type = url.searchParams.get("type") || undefined;
  const sort = url.searchParams.get("sort") as any || undefined;

  const { jobs, total } = await getJobs({ search: search || undefined, category: category || undefined, seniority: seniority || undefined, locationType, type, sort }, locals.user?.id);
  return { jobs, total, search, category, seniority };
};
