import { redirect, fail } from "@sveltejs/kit";
import { prisma } from "$lib/server";
import { getOrCreateQuest, completeTask, getUserQuests } from "$features/career-quest/server";
import type { PageServerLoad, Actions } from "./$types";

export const load: PageServerLoad = async ({ locals }) => {
  if (!locals.user) redirect(302, "/login");

  const user = await prisma.user.findUnique({
    where: { id: locals.user.id },
    select: { activeQuest: true },
  });

  const quests: any[] = [];

  if (user?.activeQuest) {
    const aq = user.activeQuest as { role: any; quest: any };
    quests.push({
      id: "active",
      title: aq.quest.title,
      description: aq.quest.description || null,
      progress: 0,
      status: "ACTIVE",
      roleId: null,
      tasks: aq.quest.tasks.map((t: any, i: number) => ({
        id: `task-${i}`,
        description: t.description,
        skillName: t.skillName || null,
        status: "PENDING",
      })),
      roleData: aq.role,
    });
  }

  if (quests.length === 0) {
    const dbQuests = await getUserQuests(locals.user.id);
    return { quests: dbQuests, user: { id: locals.user.id } };
  }

  return { quests, user: { id: locals.user.id } };
};

export const actions: Actions = {
  completeTask: async ({ locals, request }) => {
    if (!locals.user) return fail(401, { error: "Unauthorized" });
    const form = await request.formData();
    const questId = form.get("questId") as string;
    const taskId = form.get("taskId") as string;
    if (questId === "active") return fail(400, { error: "Cannot complete AI-generated tasks yet" });
    try {
      await completeTask(questId, taskId, locals.user.id);
      return { success: true };
    } catch {
      return fail(400, { error: "Failed to complete task" });
    }
  },
};
