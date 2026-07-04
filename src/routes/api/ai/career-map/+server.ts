import { generateAICareerMap } from "$lib/ai/career-map";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async ({ locals }) => {
  if (!locals.user) return new Response("Unauthorized", { status: 401 });

  try {
    const result = await generateAICareerMap(locals.user.id);
    return Response.json(result);
  } catch (e) {
    console.error("AI career map failed:", e);
    return new Response("AI generation failed", { status: 500 });
  }
};
