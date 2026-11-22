import "server-only";
import { z } from "zod";
import { idSchema, optionalText } from "@/server/http/schemas/fields";

// Request shapes of the purchase requests routes. Shapes only: the API
// checks every value again (texts, category, date, items).

export const purchaseRequestIdSchema = idSchema;

const CATEGORIES = [
  "MAINTENANCE",
  "ELECTRICAL",
  "PLUMBING",
  "PAINTING",
  "CONSTRUCTION",
  "ELEVATORS",
  "CLEANING",
  "PEST_CONTROL",
  "GARDENING",
  "POOL",
  "SECURITY",
  "TECHNOLOGY",
  "OFFICE",
  "FOOD",
  "EVENTS",
  "FURNITURE",
  "UNIFORMS",
  "GAS",
  "PROFESSIONAL",
  "OTHER",
] as const;

export const purchaseRequestInputSchema = z.object({
  title: z.string().trim().min(3).max(120),
  description: optionalText(1000),
  categories: z.array(z.enum(CATEGORIES)).min(1).max(CATEGORIES.length),
  categoryOther: optionalText(60),
  priority: z.enum(["LOW", "NORMAL", "HIGH", "URGENT"]),
  spaceId: idSchema.nullish().transform((value) => value ?? null),
  location: optionalText(80),
  neededBy: z.iso
    .date()
    .nullish()
    .transform((value) => value ?? null),
  items: z
    .array(
      z.object({
        productId: idSchema,
        quantity: z.number().positive().max(1_000_000),
        unit: z.string().trim().min(1).max(12),
        brandId: idSchema.nullish().transform((value) => value ?? null),
        note: optionalText(200),
      }),
    )
    .min(1)
    .max(50),
});

export const cancelPurchaseRequestSchema = z.object({
  reason: z.string().trim().min(3).max(300),
});
