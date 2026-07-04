import { json } from "@sveltejs/kit";
import { getRoleMatchDetail } from "$features/career-map/server";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async ({ locals, params }) => {
  if (!locals.user) return json({ error: "Unauthorized" }, { status: 401 });

  const result = await getRoleMatchDetail(locals.user.id, params.roleId);
  if (!result) return json({ error: "Role not found" }, { status: 404 });

  return json(result);
};
