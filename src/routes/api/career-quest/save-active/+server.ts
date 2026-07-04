import { json } from "@sveltejs/kit";
import { prisma } from "$lib/server";
import type { RequestHandler } from "./$types";

export const POST: RequestHandler = async ({ locals, request }) => {
  if (!locals.user) return json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { role, quest } = body;

  if (!role?.name || !quest?.title || !Array.isArray(quest?.tasks)) {
    return json({ error: "Missing required fields" }, { status: 400 });
  }

  await prisma.user.update({
    where: { id: locals.user.id },
    data: { activeQuest: { role, quest } },
  });

  return json({ success: true });
};
