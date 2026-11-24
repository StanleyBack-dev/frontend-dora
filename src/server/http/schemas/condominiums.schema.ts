import "server-only";
import { z } from "zod";
import type { AppModule } from "@/shared/graphql/schema-enums";

export const condominiumIdSchema = z.uuid();

// Shape only: the API validates the CNPJ, the UF and the lengths.
export const condominiumInputSchema = z.object({
  name: z.string().trim().min(2).max(120),
  document: z.string().trim().max(30).nullish(),
  city: z.string().trim().min(2).max(80),
  state: z.string().trim().length(2),
  addressFormat: z.enum(["APARTMENT", "HOUSE"]).optional(),
});

export const condominiumStatusSchema = z.object({
  status: z.enum(["ACTIVE", "SUSPENDED"]),
});

/** Every module sold apart (the type makes a new one show up here). */
const APP_MODULES = [
  "BOOKINGS",
  "EVENTS",
  "PARCELS",
  "LOST_AND_FOUND",
  "PURCHASES",
] as const satisfies readonly AppModule[];
type MissingModule = Exclude<AppModule, (typeof APP_MODULES)[number]>;
const everyModule: MissingModule extends never ? true : false = true;
void everyModule;

export const condominiumModuleSchema = z.object({
  module: z.enum(APP_MODULES),
  enabled: z.boolean(),
});

export const switchCondominiumSchema = z.object({
  condominiumId: z.uuid().nullable(),
});

export const unitIdSchema = z.uuid();

export const createUnitsSchema = z.object({
  street: z.string().trim().max(80).nullish(),
  block: z.string().trim().max(30).nullish(),
  numbers: z.string().trim().min(1).max(4000),
});

export const updateUnitSchema = z.object({
  street: z.string().trim().max(80).nullish(),
  block: z.string().trim().max(30).nullish(),
  number: z.string().trim().min(1).max(20),
});
