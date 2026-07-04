import { redirect, fail } from "@sveltejs/kit";
import { getOrCreateQuest, completeTask, getUserQuests } from "$features/career-quest/server";
import type { PageServerLoad, Actions } from "./$types";

export const load: PageServerLoad = async ({ locals, url }) => {
  if (!locals.user) redirect(302, "/login");

  const roleId = url.searchParams.get("roleId");
  if (roleId) {
    const quest = await getOrCreateQuest(locals.user.id, roleId);
    return { quests: [quest], user: { id: locals.user.id } };
  }

  const quests = await getUserQuests(locals.user.id);
  return { quests, user: { id: locals.user.id } };
};

export const actions: Actions = {
  completeTask: async ({ locals, request }) => {
    if (!locals.user) return fail(401, { error: "Unauthorized" });
    const form = await request.formData();
    const questId = form.get("questId") as string;
    const taskId = form.get("taskId") as string;
    try {
      await completeTask(questId, taskId, locals.user.id);
      return { success: true };
    } catch {
      return fail(400, { error: "Failed to complete task" });
    }
  },
};
