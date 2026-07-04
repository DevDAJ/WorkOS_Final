import { generateAICareerMap } from "$lib/ai/career-map";
import { suggestQuests } from "$lib/ai/suggestions";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async ({ locals }) => {
  if (!locals.user) return new Response("Unauthorized", { status: 401 });

  try {
    const result = await generateAICareerMap(locals.user.id);
    const suggestions = result.graph ? await suggestQuests(locals.user.id, result.graph) : [];
    return Response.json({ ...result, suggestions });
  } catch (e) {
    console.error("AI career map failed:", e);
    return new Response("AI generation failed", { status: 500 });
  }
};
