import "server-only";
import { z } from "zod";

export const eventIdSchema = z.uuid();

const instant = z.iso.datetime({ offset: true });

const addressSchema = z.object({
  zip: z.string().trim().max(9),
  street: z.string().trim().max(120),
  number: z.string().trim().max(10),
  complement: z.string().trim().max(80).nullable(),
  district: z.string().trim().max(80),
  city: z.string().trim().max(80),
  state: z.string().trim().length(2),
});

// Shape only: the API checks the content (period, place, limits).
export const eventInputSchema = z.object({
  title: z.string().trim().min(1).max(120),
  description: z.string().trim().max(4000).nullable(),
  spaceId: z.uuid().nullable(),
  location: z.string().trim().max(120).nullable(),
  address: addressSchema.nullable(),
  startsAt: instant,
  endsAt: instant,
  capacity: z.number().int().min(1).max(100_000),
  externalGuestLimit: z.number().int().min(0).max(100_000),
  ticketed: z.boolean(),
});

export const cancelEventSchema = z.object({
  reason: z.string().trim().min(3).max(400),
});
