declare global {
  var __prisma: import("@prisma/client").PrismaClient | undefined;

  namespace App {
    interface Locals {
      user: import("@prisma/client").User | null;
      sessionId: string | null;
    }
  }
}

export {};
