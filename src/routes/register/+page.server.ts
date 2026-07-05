import { fail, redirect } from "@sveltejs/kit";
import { registerUser, generateSessionToken, createSession, getSessionCookie } from "$features/auth/server";
import type { Actions, PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals }) => {
  if (locals.user) redirect(302, "/living-cv");
};

export const actions: Actions = {
  default: async ({ request, cookies }) => {
    const form = await request.formData();
    const email = form.get("email") as string;
    const password = form.get("password") as string;
    const name = form.get("name") as string;

    if (!email || !password) {
      return fail(400, { error: "Email and password are required" });
    }

    try {
      const user = await registerUser(email, password, name);
      const token = generateSessionToken();
      await createSession(token, user.id);
      cookies.set("session", token, {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        maxAge: 30 * 24 * 60 * 60,
      });
    } catch (e: any) {
      if (e?.code === "P2002") {
        return fail(409, { error: "Email already registered" });
      }
      return fail(500, { error: "Registration failed" });
    }

    redirect(302, "/living-cv");
  },
};
