import { z } from "zod";

export const roleDetailParamsSchema = z.object({
  roleId: z.string(),
});
