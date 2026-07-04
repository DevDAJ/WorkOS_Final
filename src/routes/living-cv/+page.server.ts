import { redirect, fail } from "@sveltejs/kit";
import { getFullCV, upsertPersonalInfo, createEducation, deleteEducation, createWorkExperience, deleteWorkExperience } from "$features/living-cv/server";
import { personalInfoSchema } from "$features/living-cv/schemas";
import type { PageServerLoad, Actions } from "./$types";

export const load: PageServerLoad = async ({ locals }) => {
  if (!locals.user) redirect(302, "/login");
  const cv = await getFullCV(locals.user.id);
  return { cv, user: { id: locals.user.id, email: locals.user.email, name: locals.user.name } };
};

export const actions: Actions = {
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

  deleteWorkExperience: async ({ locals, request }) => {
    if (!locals.user) return fail(401, { error: "Unauthorized" });
    const form = await request.formData();
    await deleteWorkExperience(form.get("id") as string, locals.user.id);
    return { success: true };
  },
};
