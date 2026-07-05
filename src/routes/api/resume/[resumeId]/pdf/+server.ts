import { prisma } from "$lib/server";
import { error } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { chromium } from "playwright";

export const GET: RequestHandler = async ({ params }) => {
  const resume = await prisma.resume.findUnique({ where: { id: params.resumeId } });
  if (!resume) throw error(404, "Resume not found");

  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage();
    await page.setContent(resume.html, { waitUntil: "networkidle" });
    const pdf = await page.pdf({ format: "letter", margin: { top: "0", bottom: "0", left: "0", right: "0" } });
    return new Response(pdf as unknown as BodyInit, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": "attachment; filename=resume.pdf",
      },
    });
  } finally {
    await browser.close();
  }
};
