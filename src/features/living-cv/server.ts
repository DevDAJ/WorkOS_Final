import { prisma } from "$lib/server";
import type { PersonalInfo, Education, WorkExperience, Certification, Award, Language, Reference, SocialLink } from "$generated/prisma/client";

export async function getPersonalInfo(userId: string): Promise<PersonalInfo | null> {
  return prisma.personalInfo.findUnique({ where: { userId } });
}

export async function upsertPersonalInfo(userId: string, data: Partial<PersonalInfo>): Promise<PersonalInfo> {
  return prisma.personalInfo.upsert({
    where: { userId },
    update: data,
    create: { userId, ...data },
  });
}

export async function getEducation(userId: string): Promise<Education[]> {
  return prisma.education.findMany({ where: { userId }, orderBy: { startDate: "desc" } });
}

export async function createEducation(userId: string, data: any): Promise<Education> {
  return prisma.education.create({
    data: { ...data, userId, startDate: new Date(data.startDate), endDate: data.endDate ? new Date(data.endDate) : null },
  });
}

export async function updateEducation(id: string, userId: string, data: any): Promise<Education> {
  return prisma.education.update({
    where: { id, userId },
    data: { ...data, startDate: new Date(data.startDate), endDate: data.endDate ? new Date(data.endDate) : null },
  });
}

export async function deleteEducation(id: string, userId: string): Promise<void> {
  await prisma.education.delete({ where: { id, userId } });
}

export async function getWorkExperience(userId: string): Promise<WorkExperience[]> {
  return prisma.workExperience.findMany({ where: { userId }, orderBy: { startDate: "desc" } });
}

export async function createWorkExperience(userId: string, data: any): Promise<WorkExperience> {
  return prisma.workExperience.create({
    data: { ...data, userId, startDate: new Date(data.startDate), endDate: data.endDate ? new Date(data.endDate) : null },
  });
}

export async function updateWorkExperience(id: string, userId: string, data: any): Promise<WorkExperience> {
  return prisma.workExperience.update({
    where: { id, userId },
    data: { ...data, startDate: new Date(data.startDate), endDate: data.endDate ? new Date(data.endDate) : null },
  });
}

export async function deleteWorkExperience(id: string, userId: string): Promise<void> {
  await prisma.workExperience.delete({ where: { id, userId } });
}

export async function getCertifications(userId: string): Promise<Certification[]> {
  return prisma.certification.findMany({ where: { userId }, orderBy: { date: "desc" } });
}

export async function getAwards(userId: string): Promise<Award[]> {
  return prisma.award.findMany({ where: { userId }, orderBy: { date: "desc" } });
}

export async function getLanguages(userId: string): Promise<Language[]> {
  return prisma.language.findMany({ where: { userId } });
}

export async function getReferences(userId: string): Promise<Reference[]> {
  return prisma.reference.findMany({ where: { userId } });
}

export async function getSocialLinks(userId: string): Promise<SocialLink[]> {
  return prisma.socialLink.findMany({ where: { userId } });
}

export async function getFullCV(userId: string) {
  return {
    personalInfo: await getPersonalInfo(userId),
    education: await getEducation(userId),
    workExperience: await getWorkExperience(userId),
    certifications: await getCertifications(userId),
    awards: await getAwards(userId),
    languages: await getLanguages(userId),
    references: await getReferences(userId),
    socialLinks: await getSocialLinks(userId),
  };
}
