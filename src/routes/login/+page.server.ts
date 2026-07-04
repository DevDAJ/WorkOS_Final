import { fail, redirect } from "@sveltejs/kit";
import { prisma } from "$lib/server";
import { loginUser, generateSessionToken, createSession } from "$lib/server/auth";
import type { Actions, PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals }) => {
  if (locals.user) redirect(302, "/living-cv");

  const demoUsers = await prisma.user.findMany({
    where: { email: { endsWith: "@demo.com" } },
    include: { personalInfo: { select: { title: true } } },
    orderBy: { name: "asc" },
  });

  return {
    demoUsers: demoUsers.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      image: u.image,
      title: u.personalInfo?.title || null,
    })),
  };
};

export const actions: Actions = {
  login: async ({ request, cookies }) => {
    const form = await request.formData();
    const email = form.get("email") as string;
    const password = form.get("password") as string;

    if (!email || !password) {
      return fail(400, { error: "Email and password are required" });
    }

    const user = await loginUser(email, password);
    if (!user) {
      return fail(401, { error: "Invalid email or password" });
    }

    const token = generateSessionToken();
    await createSession(token, user.id);
    cookies.set("session", token, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 30 * 24 * 60 * 60,
    });

    redirect(302, "/living-cv");
  },

  quickLogin: async ({ cookies, request }) => {
    const form = await request.formData();
    const userId = form.get("userId") as string;
    if (!userId) return fail(400, { error: "User ID required" });

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return fail(404, { error: "User not found" });

    const token = generateSessionToken();
    await createSession(token, user.id);
    cookies.set("session", token, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 30 * 24 * 60 * 60,
    });

    redirect(302, "/");
  },
};
