import "server-only";
import { z } from "zod";
import { idSchema, optionalText } from "@/server/http/schemas/fields";

// Request shapes of the catalog routes. Shapes only: the API checks every
// value again (names once per condominium, lengths).

export const catalogIdSchema = idSchema;

export const productInputSchema = z.object({
  name: z.string().trim().min(2).max(120),
  unit: z.string().trim().min(1).max(12),
  description: optionalText(300),
});

export const brandNameSchema = z.object({
  name: z.string().trim().min(2).max(60),
});

export const catalogActiveSchema = z.object({ active: z.boolean() });
