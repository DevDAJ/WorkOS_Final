import { generateAICareerMap } from "$lib/ai/career-map";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async ({ locals, url }) => {
  if (!locals.user) return new Response("Unauthorized", { status: 401 });

  const refresh = url.searchParams.get("refresh") === "true";
  try {
    const result = await generateAICareerMap(locals.user.id, refresh);
    return Response.json(result);
  } catch (e) {
    console.error("AI career map failed:", e);
    return new Response("AI generation failed", { status: 500 });
  }
};
