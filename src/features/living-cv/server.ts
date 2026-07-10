import { prisma } from "$lib/server";

export async function upsertPersonalInfo(userId: string, data: any): Promise<any> {
  return prisma.personalInfo.upsert({
    where: { userId },
    update: data,
    create: { userId, ...data },
  });
}

export async function createEducation(userId: string, data: any): Promise<any> {
  return prisma.education.create({
    data: { ...data, userId, startDate: new Date(data.startDate), endDate: data.endDate ? new Date(data.endDate) : null },
  });
}

export async function updateEducation(id: string, userId: string, data: any): Promise<any> {
  return prisma.education.update({
    where: { id, userId },
    data: { ...data, startDate: new Date(data.startDate), endDate: data.endDate ? new Date(data.endDate) : null },
  });
}

export async function deleteEducation(id: string, userId: string): Promise<void> {
  await prisma.education.delete({ where: { id, userId } });
}

export async function createWorkExperience(userId: string, data: any): Promise<any> {
  return prisma.workExperience.create({
    data: { ...data, userId, startDate: new Date(data.startDate), endDate: data.endDate ? new Date(data.endDate) : null },
  });
}

export async function updateWorkExperience(id: string, userId: string, data: any): Promise<any> {
  return prisma.workExperience.update({
    where: { id, userId },
    data: { ...data, startDate: new Date(data.startDate), endDate: data.endDate ? new Date(data.endDate) : null },
  });
}

export async function deleteWorkExperience(id: string, userId: string): Promise<void> {
  await prisma.workExperience.delete({ where: { id, userId } });
}

export async function createProject(userId: string, data: any): Promise<any> {
  return prisma.project.create({ data: { ...data, userId } });
}

export async function updateProject(id: string, userId: string, data: any): Promise<any> {
  return prisma.project.update({ where: { id, userId }, data });
}

export async function deleteProject(id: string, userId: string): Promise<void> {
  await prisma.project.delete({ where: { id, userId } });
}

export async function createCertification(userId: string, data: any): Promise<any> {
  return prisma.certification.create({
    data: { ...data, userId, date: data.date ? new Date(data.date) : null },
  });
}

export async function updateCertification(id: string, userId: string, data: any): Promise<any> {
  return prisma.certification.update({
    where: { id, userId },
    data: { ...data, date: data.date ? new Date(data.date) : undefined },
  });
}

export async function deleteCertification(id: string, userId: string): Promise<void> {
  await prisma.certification.delete({ where: { id, userId } });
}

export async function createAward(userId: string, data: any): Promise<any> {
  return prisma.award.create({
    data: { ...data, userId, date: data.date ? new Date(data.date) : null },
  });
}

export async function updateAward(id: string, userId: string, data: any): Promise<any> {
  return prisma.award.update({
    where: { id, userId },
    data: { ...data, date: data.date ? new Date(data.date) : undefined },
  });
}

export async function deleteAward(id: string, userId: string): Promise<void> {
  await prisma.award.delete({ where: { id, userId } });
}

export async function createLanguage(userId: string, data: any): Promise<any> {
  return prisma.language.create({ data: { ...data, userId } });
}

export async function updateLanguage(id: string, userId: string, data: any): Promise<any> {
  return prisma.language.update({ where: { id, userId }, data });
}

export async function deleteLanguage(id: string, userId: string): Promise<void> {
  await prisma.language.delete({ where: { id, userId } });
}

export async function createReference(userId: string, data: any): Promise<any> {
  return prisma.reference.create({ data: { ...data, userId } });
}

export async function updateReference(id: string, userId: string, data: any): Promise<any> {
  return prisma.reference.update({ where: { id, userId }, data });
}

export async function deleteReference(id: string, userId: string): Promise<void> {
  await prisma.reference.delete({ where: { id, userId } });
}

export async function createSocialLink(userId: string, data: any): Promise<any> {
  return prisma.socialLink.create({ data: { ...data, userId } });
}

export async function updateSocialLink(id: string, userId: string, data: any): Promise<any> {
  return prisma.socialLink.update({ where: { id, userId }, data });
}

export async function deleteSocialLink(id: string, userId: string): Promise<void> {
  await prisma.socialLink.delete({ where: { id, userId } });
}

export async function getFullCV(userId: string) {
  const [personalInfo, education, workExperience, projects, certifications, awards, languages, references, socialLinks] =
    await Promise.all([
      prisma.personalInfo.findUnique({ where: { userId } }),
      prisma.education.findMany({ where: { userId }, orderBy: { startDate: "desc" } }),
      prisma.workExperience.findMany({ where: { userId }, orderBy: { startDate: "desc" } }),
      prisma.project.findMany({ where: { userId }, orderBy: { createdAt: "desc" } }),
      prisma.certification.findMany({ where: { userId }, orderBy: { date: "desc" } }),
      prisma.award.findMany({ where: { userId }, orderBy: { date: "desc" } }),
      prisma.language.findMany({ where: { userId } }),
      prisma.reference.findMany({ where: { userId } }),
      prisma.socialLink.findMany({ where: { userId } }),
    ]);
  return { personalInfo, education, workExperience, projects, certifications, awards, languages, references, socialLinks };
}
