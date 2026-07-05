import { redirect, fail } from "@sveltejs/kit";
import { updateUser } from "$features/auth/server";
import {
  getFullCV, upsertPersonalInfo,
  createEducation, updateEducation, deleteEducation,
  createWorkExperience, updateWorkExperience, deleteWorkExperience,
  createProject, updateProject, deleteProject,
  createCertification, updateCertification, deleteCertification,
  createAward, updateAward, deleteAward,
  createLanguage, updateLanguage, deleteLanguage,
  createReference, updateReference, deleteReference,
  createSocialLink, updateSocialLink, deleteSocialLink,
} from "$features/living-cv/server";
import {
  personalInfoSchema, certificationSchema, awardSchema,
  languageSchema, referenceSchema, socialLinkSchema,
} from "$features/living-cv/schemas";
import type { PageServerLoad, Actions } from "./$types";

export const load: PageServerLoad = async ({ locals }) => {
  if (!locals.user) redirect(302, "/login");
  const cv = await getFullCV(locals.user.id);
  return { cv, user: { id: locals.user.id, email: locals.user.email, name: locals.user.name, image: locals.user.image } };
};

export const actions: Actions = {
  updateUser: async ({ locals, request }) => {
    if (!locals.user) return fail(401, { error: "Unauthorized" });
    const form = await request.formData();
    const name = form.get("name") as string;
    const image = form.get("image") as string;
    await updateUser(locals.user.id, { name: name || undefined, image: image || undefined });
    return { success: true };
  },

  savePersonalInfo: async ({ locals, request }) => {
    if (!locals.user) return fail(401, { error: "Unauthorized" });
    const form = await request.formData();
    const data = JSON.parse(form.get("data") as string);
    const parsed = personalInfoSchema.safeParse(data);
    if (!parsed.success) return fail(400, { error: "Invalid data", issues: parsed.error.issues });
    await upsertPersonalInfo(locals.user.id, parsed.data);
    return { success: true };
  },

  addEducation: async ({ locals, request }) => {
    if (!locals.user) return fail(401, { error: "Unauthorized" });
    const form = await request.formData();
    const data = JSON.parse(form.get("data") as string);
    await createEducation(locals.user.id, data);
    return { success: true };
  },

  updateEducation: async ({ locals, request }) => {
    if (!locals.user) return fail(401, { error: "Unauthorized" });
    const form = await request.formData();
    const data = JSON.parse(form.get("data") as string);
    await updateEducation(data.id, locals.user.id, data);
    return { success: true };
  },

  deleteEducation: async ({ locals, request }) => {
    if (!locals.user) return fail(401, { error: "Unauthorized" });
    const form = await request.formData();
    await deleteEducation(form.get("id") as string, locals.user.id);
    return { success: true };
  },

  addWorkExperience: async ({ locals, request }) => {
    if (!locals.user) return fail(401, { error: "Unauthorized" });
    const form = await request.formData();
    const data = JSON.parse(form.get("data") as string);
    await createWorkExperience(locals.user.id, data);
    return { success: true };
  },

  updateWorkExperience: async ({ locals, request }) => {
    if (!locals.user) return fail(401, { error: "Unauthorized" });
    const form = await request.formData();
    const data = JSON.parse(form.get("data") as string);
    await updateWorkExperience(data.id, locals.user.id, data);
    return { success: true };
  },

  deleteWorkExperience: async ({ locals, request }) => {
    if (!locals.user) return fail(401, { error: "Unauthorized" });
    const form = await request.formData();
    await deleteWorkExperience(form.get("id") as string, locals.user.id);
    return { success: true };
  },

  addProject: async ({ locals, request }) => {
    if (!locals.user) return fail(401, { error: "Unauthorized" });
    const form = await request.formData();
    const data = JSON.parse(form.get("data") as string);
    await createProject(locals.user.id, data);
    return { success: true };
  },

  updateProject: async ({ locals, request }) => {
    if (!locals.user) return fail(401, { error: "Unauthorized" });
    const form = await request.formData();
    const data = JSON.parse(form.get("data") as string);
    await updateProject(data.id, locals.user.id, data);
    return { success: true };
  },

  deleteProject: async ({ locals, request }) => {
    if (!locals.user) return fail(401, { error: "Unauthorized" });
    const form = await request.formData();
    await deleteProject(form.get("id") as string, locals.user.id);
    return { success: true };
  },

  addCertification: async ({ locals, request }) => {
    if (!locals.user) return fail(401, { error: "Unauthorized" });
    const form = await request.formData();
    const data = JSON.parse(form.get("data") as string);
    const parsed = certificationSchema.safeParse(data);
    if (!parsed.success) return fail(400, { error: "Invalid data", issues: parsed.error.issues });
    await createCertification(locals.user.id, parsed.data);
    return { success: true };
  },

  updateCertification: async ({ locals, request }) => {
    if (!locals.user) return fail(401, { error: "Unauthorized" });
    const form = await request.formData();
    const data = JSON.parse(form.get("data") as string);
    const parsed = certificationSchema.safeParse(data);
    if (!parsed.success) return fail(400, { error: "Invalid data", issues: parsed.error.issues });
    await updateCertification(parsed.data.id!, locals.user.id, parsed.data);
    return { success: true };
  },

  deleteCertification: async ({ locals, request }) => {
    if (!locals.user) return fail(401, { error: "Unauthorized" });
    const form = await request.formData();
    await deleteCertification(form.get("id") as string, locals.user.id);
    return { success: true };
  },

  addAward: async ({ locals, request }) => {
    if (!locals.user) return fail(401, { error: "Unauthorized" });
    const form = await request.formData();
    const data = JSON.parse(form.get("data") as string);
    const parsed = awardSchema.safeParse(data);
    if (!parsed.success) return fail(400, { error: "Invalid data", issues: parsed.error.issues });
    await createAward(locals.user.id, parsed.data);
    return { success: true };
  },

  updateAward: async ({ locals, request }) => {
    if (!locals.user) return fail(401, { error: "Unauthorized" });
    const form = await request.formData();
    const data = JSON.parse(form.get("data") as string);
    const parsed = awardSchema.safeParse(data);
    if (!parsed.success) return fail(400, { error: "Invalid data", issues: parsed.error.issues });
    await updateAward(parsed.data.id!, locals.user.id, parsed.data);
    return { success: true };
  },

  deleteAward: async ({ locals, request }) => {
    if (!locals.user) return fail(401, { error: "Unauthorized" });
    const form = await request.formData();
    await deleteAward(form.get("id") as string, locals.user.id);
    return { success: true };
  },

  addLanguage: async ({ locals, request }) => {
    if (!locals.user) return fail(401, { error: "Unauthorized" });
    const form = await request.formData();
    const data = JSON.parse(form.get("data") as string);
    const parsed = languageSchema.safeParse(data);
    if (!parsed.success) return fail(400, { error: "Invalid data", issues: parsed.error.issues });
    await createLanguage(locals.user.id, parsed.data);
    return { success: true };
  },

  updateLanguage: async ({ locals, request }) => {
    if (!locals.user) return fail(401, { error: "Unauthorized" });
    const form = await request.formData();
    const data = JSON.parse(form.get("data") as string);
    const parsed = languageSchema.safeParse(data);
    if (!parsed.success) return fail(400, { error: "Invalid data", issues: parsed.error.issues });
    await updateLanguage(parsed.data.id!, locals.user.id, parsed.data);
    return { success: true };
  },

  deleteLanguage: async ({ locals, request }) => {
    if (!locals.user) return fail(401, { error: "Unauthorized" });
    const form = await request.formData();
    await deleteLanguage(form.get("id") as string, locals.user.id);
    return { success: true };
  },

  addReference: async ({ locals, request }) => {
    if (!locals.user) return fail(401, { error: "Unauthorized" });
    const form = await request.formData();
    const data = JSON.parse(form.get("data") as string);
    const parsed = referenceSchema.safeParse(data);
    if (!parsed.success) return fail(400, { error: "Invalid data", issues: parsed.error.issues });
    await createReference(locals.user.id, parsed.data);
    return { success: true };
  },

  updateReference: async ({ locals, request }) => {
    if (!locals.user) return fail(401, { error: "Unauthorized" });
    const form = await request.formData();
    const data = JSON.parse(form.get("data") as string);
    const parsed = referenceSchema.safeParse(data);
    if (!parsed.success) return fail(400, { error: "Invalid data", issues: parsed.error.issues });
    await updateReference(parsed.data.id!, locals.user.id, parsed.data);
    return { success: true };
  },

  deleteReference: async ({ locals, request }) => {
    if (!locals.user) return fail(401, { error: "Unauthorized" });
    const form = await request.formData();
    await deleteReference(form.get("id") as string, locals.user.id);
    return { success: true };
  },

  addSocialLink: async ({ locals, request }) => {
    if (!locals.user) return fail(401, { error: "Unauthorized" });
    const form = await request.formData();
    const data = JSON.parse(form.get("data") as string);
    const parsed = socialLinkSchema.safeParse(data);
    if (!parsed.success) return fail(400, { error: "Invalid data", issues: parsed.error.issues });
    await createSocialLink(locals.user.id, parsed.data);
    return { success: true };
  },

  updateSocialLink: async ({ locals, request }) => {
    if (!locals.user) return fail(401, { error: "Unauthorized" });
    const form = await request.formData();
    const data = JSON.parse(form.get("data") as string);
    const parsed = socialLinkSchema.safeParse(data);
    if (!parsed.success) return fail(400, { error: "Invalid data", issues: parsed.error.issues });
    await updateSocialLink(parsed.data.id!, locals.user.id, parsed.data);
    return { success: true };
  },

  deleteSocialLink: async ({ locals, request }) => {
    if (!locals.user) return fail(401, { error: "Unauthorized" });
    const form = await request.formData();
    await deleteSocialLink(form.get("id") as string, locals.user.id);
    return { success: true };
  },
};
