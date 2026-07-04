import { prisma } from "$lib/server";
import { redirect } from "@sveltejs/kit";
import { getJobs } from "$lib/server/jobs";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals, url }) => {
  if (!locals.user) redirect(302, "/login");

  const filters = {
    search: url.searchParams.get("search") || undefined,
    category: url.searchParams.get("category") || undefined,
    seniority: url.searchParams.get("seniority") || undefined,
    locationType: url.searchParams.get("locationType") || undefined,
    type: url.searchParams.get("type") || undefined,
    sort: (url.searchParams.get("sort") || "newest") as any,
  };

  const [jobData, userSkills] = await Promise.all([
    getJobs(filters),
    prisma.skill.findMany({
      where: { userId: locals.user.id },
      select: { name: true },
    }),
  ]);

  const userSkillNames = new Set(userSkills.map((s) => s.name.toLowerCase()));

  const jobs = jobData.jobs.map((job) => {
    const jobSkills = job.skills.map((s) => s.toLowerCase());
    const matchedSkills = jobSkills.filter((s) => userSkillNames.has(s));
    const matchScore = jobSkills.length > 0 ? Math.round((matchedSkills.length / jobSkills.length) * 100) : 0;
    const gaps = jobSkills.filter((s) => !userSkillNames.has(s));
    return { ...job, matchScore, strengths: matchedSkills, gaps };
  });

  jobs.sort((a, b) => {
    if (a.matchScore !== b.matchScore) return b.matchScore - a.matchScore;
    return (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0);
  });

  return { jobs, total: jobData.total };
};

export const config = {
  isr: { expiration: 60 },
};
