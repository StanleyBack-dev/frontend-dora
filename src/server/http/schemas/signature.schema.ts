import "server-only";
import { z } from "zod";
import { optionalText } from "@/server/http/schemas/fields";

// The on-screen signature sent by the desk (parcel pickup, found item
// return): who signs and the evidence. Shapes only: the API checks the
// declaration, the drawing and the evidence again.

const base64 = (max: number) =>
  z
    .string()
    .max(max)
    .regex(/^[A-Za-z0-9+/]+={0,2}$/);

const optionalNumber = z.number().finite().nullish();

export const signatureSchema = z.object({
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
