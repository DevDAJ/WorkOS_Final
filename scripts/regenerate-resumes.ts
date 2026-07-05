import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaNeonHttp } from "@prisma/adapter-neon";
import { generateResumeHtml } from "../src/features/resume/server";

const DATABASE_URL = process.env["DATABASE_URL"]!;
const adapter = new PrismaNeonHttp(DATABASE_URL, {});
const prisma = new PrismaClient({ adapter });

async function main() {
  const resumes = await prisma.resume.findMany();
  console.log(`Found ${resumes.length} resumes to regenerate`);

  for (const r of resumes) {
    const app = await prisma.application.findUnique({
      where: { id: r.applicationId },
      select: { jobId: true, userId: true },
    });
    if (!app) {
      console.log(`  Skipping resume ${r.id}: no application`);
      continue;
    }

    const result = await generateResumeHtml(app.userId, app.jobId);
    if (result) {
      await prisma.resume.update({
        where: { id: r.id },
        data: { html: result.html, style: result.style },
      });
      console.log(`  Updated resume ${r.id}`);
    } else {
      console.log(`  Skipping resume ${r.id}: generation returned null`);
    }
  }

  console.log("Done");
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
