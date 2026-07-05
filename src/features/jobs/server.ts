import { prisma } from "$lib/server";
import type {
  Job as JobModel,
  Application,
  Prisma,
} from "$generated/prisma/client";
import { seedJobs } from "./seed";

let seeded = false;

export async function seedJobsOnce() {
  if (seeded) return;
  const existing = await prisma.job.findFirst();
  if (existing) return;
  for (const job of seedJobs) {
    await prisma.job.create({ data: job });
  }
  seeded = true;
}

const PAGE_SIZE = 10;

export interface JobFilters {
  search?: string;
  category?: string;
  seniority?: string;
  locationType?: string;
  type?: string;
  salaryMin?: number;
  salaryMax?: number;
  sort?: "newest" | "salary_high" | "salary_low";
  page?: number;
}

export async function getJobs(filters: JobFilters) {
  const where: Prisma.JobWhereInput = { status: "ACTIVE" };

  if (filters.search) {
    const q = filters.search;
    where.OR = [
      { title: { contains: q, mode: "insensitive" } },
      { company: { contains: q, mode: "insensitive" } },
      { description: { contains: q, mode: "insensitive" } },
    ];
  }
  if (filters.category) where.category = filters.category as any;
  if (filters.seniority) where.seniority = filters.seniority as any;
  if (filters.locationType) where.locationType = filters.locationType as any;
  if (filters.type) where.type = filters.type as any;
  if (filters.salaryMin) where.salaryMin = { gte: filters.salaryMin };
  if (filters.salaryMax) where.salaryMax = { lte: filters.salaryMax };

  let orderBy: Prisma.JobOrderByWithRelationInput = { createdAt: "desc" };
  if (filters.sort === "salary_high") orderBy = { salaryMax: "desc" };
  else if (filters.sort === "salary_low") orderBy = { salaryMin: "asc" };

  const page = Math.max(1, filters.page ?? 1);
  const skip = (page - 1) * PAGE_SIZE;

  const [jobs, total] = await Promise.all([
    prisma.job.findMany({ where, orderBy, skip, take: PAGE_SIZE }),
    prisma.job.count({ where }),
  ]);

  return { jobs, total, page, totalPages: Math.ceil(total / PAGE_SIZE) };
}

export async function getJob(id: string) {
  return prisma.job.findUnique({ where: { id } });
}

export async function applyToJob(jobId: string, userId: string, coverLetter?: string) {
  const existing = await prisma.application.findUnique({
    where: { jobId_userId: { jobId, userId } },
  });
  if (existing) {
    if (existing.status === "WITHDRAWN") {
      return prisma.application.update({
        where: { id: existing.id },
        data: { status: "PENDING", coverLetter: coverLetter ?? existing.coverLetter },
      });
    }
    return existing;
  }

  const [application] = await Promise.all([
    prisma.application.create({
      data: { jobId, userId, coverLetter },
    }),
    prisma.job.update({
      where: { id: jobId },
      data: { applicationCount: { increment: 1 } },
    }),
  ]);

  return application;
}

export async function withdrawApplication(jobId: string, userId: string) {
  return prisma.application.update({
    where: { jobId_userId: { jobId, userId } },
    data: { status: "WITHDRAWN" },
  });
}

export async function updateApplication(jobId: string, userId: string, data: Prisma.ApplicationUpdateInput) {
  return prisma.application.update({
    where: { jobId_userId: { jobId, userId } },
    data,
  });
}

export async function getUserApplications(userId: string) {
  return prisma.application.findMany({
    where: { userId },
    include: { job: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function getApplicationStatus(jobId: string, userId: string) {
  return prisma.application.findUnique({
    where: { jobId_userId: { jobId, userId } },
  });
}
