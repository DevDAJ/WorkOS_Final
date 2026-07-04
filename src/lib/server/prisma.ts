import { PrismaClient } from "$generated/prisma/client";
import { PrismaNeonHttp } from "@prisma/adapter-neon";
import { DATABASE_URL } from "$env/static/private";

const adapter = new PrismaNeonHttp(DATABASE_URL);
const prisma = globalThis.__prisma ?? new PrismaClient({ adapter });

if (import.meta.env.DEV) {
  globalThis.__prisma = prisma;
}

export { prisma };
