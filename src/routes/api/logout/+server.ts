import { redirect } from "@sveltejs/kit";
import { deleteSession } from "$features/auth/server";

export async function POST({ locals, cookies }) {
  if (locals.sessionId) await deleteSession(locals.sessionId);
  cookies.delete("session", { path: "/" });
  throw redirect(303, "/");
}
