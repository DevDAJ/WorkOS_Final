import { upgradeQuestWithAI } from "$features/career-quest/server";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async ({ locals, url }) => {
  if (!locals.user) return new Response("Unauthorized", { status: 401 });

  const questId = url.searchParams.get("questId");
  if (!questId) return new Response("Missing questId", { status: 400 });

  try {
    const quest = await upgradeQuestWithAI(questId, locals.user.id);
    return Response.json(quest);
  } catch (e) {
    console.error("AI quest upgrade failed:", e);
    return new Response("AI upgrade failed", { status: 500 });
  }
};
