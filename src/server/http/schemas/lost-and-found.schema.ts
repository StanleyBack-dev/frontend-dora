import "server-only";
import { z } from "zod";
import { idSchema, optionalText } from "@/server/http/schemas/fields";
import { signatureSchema } from "@/server/http/schemas/signature.schema";

// Request shapes of the lost and found routes. Shapes only: the API checks
// every value again (category, texts, photo, claim, signature).

export const foundItemIdSchema = idSchema;
export const foundItemClaimIdSchema = idSchema;

const CATEGORIES = [
  "DOCUMENT",
  "KEYS",
  "ELECTRONICS",
  "CLOTHING",
  "ACCESSORY",
  "BAG",
  "TOY",
  "OTHER",
] as const;

export const registerFoundItemSchema = z.object({
  category: z.enum(CATEGORIES),
  title: z.string().trim().min(2).max(80),
  description: optionalText(300),
  privateDetails: optionalText(300),
  foundLocation: z.string().trim().min(2).max(80),
  foundAt: z.iso.datetime({ offset: true }).nullish(),
  storageLocation: z.string().trim().min(2).max(60),
  photo: z
    .string()
    .max(1_400_000)
    .regex(/^[A-Za-z0-9+/]+={0,2}$/)
    .nullish(),
  photoHidden: z.boolean().nullish(),
});

export const returnFoundItemSchema = signatureSchema.extend({
  claimId: idSchema.nullish(),
});

export const closeFoundItemSchema = z.object({
  reason: z.string().trim().min(3).max(300),
});

export const decideClaimSchema = z.object({
  accept: z.boolean(),
  note: optionalText(300),
});
