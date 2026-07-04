import { PrismaClient } from "$generated/prisma/client";
import { PrismaNeonHttp } from "@prisma/adapter-neon";
import { DATABASE_URL } from "$env/static/private";

let _prisma: PrismaClient | null = null;

function getPrisma() {
  if (!_prisma) {
    const adapter = new PrismaNeonHttp(DATABASE_URL, {});
    _prisma = globalThis.__prisma ?? new PrismaClient({ adapter });
    if (import.meta.env.DEV) {
      globalThis.__prisma = _prisma;
    }
  }
  return _prisma;
}

export const prisma = new Proxy({} as PrismaClient, {
  get(_, prop) {
    return Reflect.get(getPrisma()!, prop);
  },
  apply(_, _this, args) {
    return Reflect.apply(getPrisma()! as any, _this, args);
  },
});
