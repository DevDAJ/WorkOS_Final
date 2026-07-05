import { prisma } from "$lib/server";
import type { User } from "$generated/prisma/client";
import { randomBytes, createHash } from "node:crypto";

const SESSION_COOKIE = "session";
const SESSION_EXPIRY = 30 * 24 * 60 * 60 * 1000;

// ponytail: in-memory session cache, invalidate-on-delete + 5min TTL
const sessionCache = new Map<string, { user: User; expiresAt: Date; cachedAt: number }>();
const CACHE_TTL = 5 * 60 * 1000;

function getCached(token: string): User | null {
  const entry = sessionCache.get(token);
  if (!entry) return null;
  if (Date.now() - entry.cachedAt > CACHE_TTL || entry.expiresAt < new Date()) {
    sessionCache.delete(token);
    return null;
  }
  return entry.user;
}

function setCached(token: string, user: User, expiresAt: Date) {
  sessionCache.set(token, { user, expiresAt, cachedAt: Date.now() });
}

export function generateSessionToken(): string {
  return randomBytes(32).toString("base64url");
}

export async function createSession(token: string, userId: string): Promise<string> {
  await prisma.session.create({
    data: { id: token, userId, expiresAt: new Date(Date.now() + SESSION_EXPIRY) },
  });
  return token;
}

export async function validateSession(token: string): Promise<User | null> {
  const cached = getCached(token);
  if (cached) return cached;

  const session = await prisma.session.findUnique({
    where: { id: token },
    include: { user: true },
  });
  if (!session || session.expiresAt < new Date()) {
    if (session) {
      sessionCache.delete(token);
      await prisma.session.delete({ where: { id: token } });
    }
    return null;
  }
  setCached(token, session.user, session.expiresAt);
  return session.user;
}

export async function deleteSession(token: string): Promise<void> {
  sessionCache.delete(token);
  await prisma.session.delete({ where: { id: token } });
}

export function getSessionCookie(token: string): string {
  return `${SESSION_COOKIE}=${token}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${SESSION_EXPIRY / 1000}`;
}

export function getClearSessionCookie(): string {
  return `${SESSION_COOKIE}=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0`;
}

export function getSessionTokenFromRequest(request: Request): string | null {
  const cookies = request.headers.get("cookie") || "";
  const match = cookies.match(new RegExp(`${SESSION_COOKIE}=([^;]+)`));
  return match ? match[1] : null;
}

export async function registerUser(email: string, password: string, name?: string): Promise<User> {
  const passwordHash = hashPassword(password);
  return prisma.user.create({
    data: { email, passwordHash, name },
  });
}

export async function loginUser(email: string, password: string): Promise<User | null> {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return null;
  const hash = hashPassword(password);
  return hash === user.passwordHash ? user : null;
}

export async function updateUser(userId: string, data: { name?: string; image?: string }): Promise<User> {
  return prisma.user.update({ where: { id: userId }, data });
}

// ponytail: sha256 for dev speed, upgrade to bcrypt/argon2 before prod
function hashPassword(password: string): string {
  return createHash("sha256").update(password).digest("base64url");
}
