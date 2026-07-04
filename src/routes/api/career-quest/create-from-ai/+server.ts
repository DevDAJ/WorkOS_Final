import { json } from "@sveltejs/kit";
import { prisma } from "$lib/server";
import { RoleCategory, SeniorityLevel, QuestStatus } from "$generated/prisma/enums";
import type { RequestHandler } from "./$types";

function normalizeEnum<T extends string>(value: string, valid: Record<string, T>): T | undefined {
  const key = value.toUpperCase().replace(/[\s-]/g, "_");
  return valid[key as keyof typeof valid] as T | undefined;
}

export const POST: RequestHandler = async ({ locals, request }) => {
  if (!locals.user) return json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { name, category, seniority, description, quest } = body;

  if (!name || !quest?.title || !Array.isArray(quest?.tasks)) {
    return json({ error: "Missing required fields" }, { status: 400 });
  }

  const categoryEnum = normalizeEnum(category || "", RoleCategory);
  const seniorityEnum = normalizeEnum(seniority || "", SeniorityLevel);

  const role = await prisma.careerRole.create({
    data: {
      name,
      category: categoryEnum || "OTHER",
      seniority: seniorityEnum || "MID",
      description: description || null,
    },
  });

  const careerQuest = await prisma.careerQuest.create({
    data: {
      userId: locals.user.id,
      roleId: role.id,
      title: quest.title,
      description: quest.description || null,
      status: QuestStatus.ACTIVE,
      tasks: {
        create: quest.tasks.map((t: { description: string; skillName: string }) => ({
          description: t.description,
          skillName: t.skillName || null,
        })),
      },
    },
    include: { tasks: true },
  });

  return json({ roleId: role.id, questId: careerQuest.id });
};
