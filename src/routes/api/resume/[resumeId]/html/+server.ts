import { prisma } from "$lib/server";
import { error } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async ({ params }) => {
  const resume = await prisma.resume.findUnique({ where: { id: params.resumeId } });
  if (!resume) throw error(404, "Resume not found");

  return new Response(resume.html, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
};
