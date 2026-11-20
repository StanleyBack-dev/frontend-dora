import "server-only";
import { z } from "zod";
import { idSchema, optionalText } from "@/server/http/schemas/fields";

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

export const closeParcelSchema = z.object({
  reason: z.string().trim().min(3).max(300),
});

const optionalNumber = z.number().finite().nullish();

export const pickUpParcelSchema = z.object({
  code: parcelCodeSchema,
  signerName: z.string().trim().min(3).max(120),
  signerDocumentType: z.enum(["CPF", "RG"]).nullish(),
  signerDocument: optionalText(20),
  declarationShown: z.string().min(10).max(1000),
  signatureImage: base64(560_000),
  signatureDrawing: z.string().min(2).max(600_000),
  clientSignedAt: z.iso.datetime({ offset: true }).nullish(),
  clientTimeZone: optionalText(64),
  location: z.object({
    status: z.enum(["GRANTED", "DENIED", "UNAVAILABLE"]),
    latitude: optionalNumber,
    longitude: optionalNumber,
    accuracyMeters: optionalNumber,
  }),
  device: z
    .object({
      platform: optionalText(60),
      language: optionalText(35),
      screenWidth: z.number().int().min(0).max(20_000).nullish(),
      screenHeight: z.number().int().min(0).max(20_000).nullish(),
      pixelRatio: z.number().min(0).max(10).nullish(),
      pointerType: optionalText(10),
      maxTouchPoints: z.number().int().min(0).max(100).nullish(),
    })
    .nullish(),
});

export const recipientSearchSchema = z.string().trim().max(60);
