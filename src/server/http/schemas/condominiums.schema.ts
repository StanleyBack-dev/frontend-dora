import "server-only";
import { z } from "zod";

export const condominiumIdSchema = z.uuid();

// Shape only: the API validates the CNPJ, the UF and the lengths.
export const condominiumInputSchema = z.object({
  name: z.string().trim().min(2).max(120),
  document: z.string().trim().max(30).nullish(),
  city: z.string().trim().min(2).max(80),
  state: z.string().trim().length(2),
});

export const condominiumStatusSchema = z.object({
  status: z.enum(["ACTIVE", "SUSPENDED"]),
});

export const switchCondominiumSchema = z.object({
  condominiumId: z.uuid().nullable(),
});

export const unitIdSchema = z.uuid();

export const createUnitsSchema = z.object({
  block: z.string().trim().max(30).nullish(),
  numbers: z.string().trim().min(1).max(4000),
});

export const updateUnitSchema = z.object({
  block: z.string().trim().max(30).nullish(),
  number: z.string().trim().min(1).max(20),
});
