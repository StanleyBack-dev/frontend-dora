import "server-only";
import { z } from "zod";
import { idSchema, optionalText } from "@/server/http/schemas/fields";
import { signatureSchema } from "@/server/http/schemas/signature.schema";

// Request shapes of the parcels routes. Shapes only: the API checks every
// value again (unit, code, signature, evidence).

const base64 = (max: number) =>
  z
    .string()
    .max(max)
    .regex(/^[A-Za-z0-9+/]+={0,2}$/);

export const parcelIdSchema = idSchema;

export const parcelCodeSchema = z
  .string()
  .trim()
  .regex(/^[A-Za-z0-9 ·-]{4,20}$/);

export const registerParcelSchema = z.object({
  unitId: idSchema,
  recipientName: optionalText(120),
  recipientUserId: idSchema.nullish(),
  carrier: optionalText(60),
  trackingCode: optionalText(60),
  notes: optionalText(300),
  storageLocation: optionalText(60),
  photo: base64(1_400_000).nullish(),
  perishable: z.boolean().nullish(),
  perishableHours: z.number().int().min(1).max(72).nullish(),
});

export const authorizePickupSchema = z.object({
  name: z.string().trim().min(3).max(120),
  documentType: z.enum(["CPF", "RG"]).nullish(),
  document: optionalText(20),
});

export const closeParcelSchema = z.object({
  reason: z.string().trim().min(3).max(300),
});

export const pickUpParcelSchema = signatureSchema.extend({
  code: parcelCodeSchema,
});

export const recipientSearchSchema = z.string().trim().max(60);
