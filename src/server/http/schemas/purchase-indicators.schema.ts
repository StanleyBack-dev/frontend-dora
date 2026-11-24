import { z } from "zod";

/** A year and, optionally, a month (as the pages' query: ?ano=2026&mes=11). */
export const periodQuerySchema = z
  .object({
    ano: z.coerce.number().int().min(2020).max(2100),
    mes: z.coerce.number().int().min(1).max(12).optional(),
  })
  .transform(({ ano, mes }) => ({ year: ano, month: mes ?? null }));

export const publishTransparencySchema = z.object({ enabled: z.boolean() });
