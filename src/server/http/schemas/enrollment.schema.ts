import "server-only";
import { z } from "zod";

export const enrollmentCodeSchema = z.object({
  code: z
    .string()
    .trim()
    .regex(/^\d{6}$/),
});

export const enrollmentDataSchema = z.object({
  fullName: z.string().trim().min(1).max(160),
  email: z.string().trim().min(1).max(254),
  phone: z.string().trim().min(1).max(20),
  // Absent on approval: keeps the unit chosen on the form.
  unitId: z.uuid().nullish(),
  unitComplement: z.string().trim().max(80).nullish(),
  // Only when the condominium has no units (absent: keeps what was typed).
  unitBlock: z.string().trim().max(30).nullish(),
  unitNumber: z.string().trim().max(20).nullish(),
});

export const submitEnrollmentSchema = z.object({
  data: enrollmentDataSchema,
  consent: z.boolean(),
  /** Base64 of the photo the browser shrank (the API checks the content). */
  photo: z
    .string()
    .max(2_800_000)
    .regex(/^[A-Za-z0-9+/]+={0,2}$/)
    .nullish()
    .transform((value) => value ?? null),
});

export const enrollmentInviteSchema = z.object({
  label: z.string().trim().min(2).max(80),
  validDays: z.number().int().min(1).max(30),
});
