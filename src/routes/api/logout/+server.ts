import { redirect } from "@sveltejs/kit";
import { deleteSession } from "$lib/server/auth";

export async function POST({ locals, cookies }) {
  if (locals.sessionId) await deleteSession(locals.sessionId);
  cookies.delete("session", { path: "/" });
  throw redirect(303, "/");
}
