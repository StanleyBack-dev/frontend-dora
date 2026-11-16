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

// Shape only: the API checks the key by its type.
export const pixReceiverSchema = z.object({
  keyType: z.enum(["CPF", "CNPJ", "PHONE", "EMAIL", "RANDOM"]),
  key: z.string().trim().min(1).max(120),
  name: z.string().trim().min(1).max(80),
  city: z.string().trim().min(1).max(80),
});

const ticketTypeSchema = z.object({
  id: z.uuid().nullable(),
  kind: z.enum([
    "ADULT",
    "CHILD",
    "INFANT",
    "SENIOR",
    "STUDENT",
    "PCD",
    "TEACHER",
  ]),
  priceMode: z.enum(["FULL", "HALF", "FREE", "CUSTOM"]),
  customPriceCents: z.number().int().min(0).max(10_000_000).nullable(),
  minAge: z.number().int().min(0).max(120).nullable(),
  maxAge: z.number().int().min(0).max(120).nullable(),
});

// Shape only: the API checks the content (period, place, limits, tickets).
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
  fullPriceCents: z.number().int().min(1).max(10_000_000).nullable(),
  ticketTypes: z.array(ticketTypeSchema).max(10),
  unitTicketLimit: z.number().int().min(1).max(1000).nullable(),
  pixSource: z.enum(["CONDOMINIUM", "CUSTOM"]).nullable(),
  customPix: pixReceiverSchema.nullable(),
});

export const orderIdSchema = z.uuid();

export const orderStatusSchema = z.enum([
  "PENDING_PAYMENT",
  "AWAITING_REVIEW",
  "CONFIRMED",
  "REJECTED",
  "EXPIRED",
  "CANCELLED",
]);

export const createOrderSchema = z.object({
  attendees: z
    .array(
      z.object({
        source: z.enum(["SELF", "DEPENDENT", "GUEST"]),
        dependentId: z.uuid().nullable(),
        name: z.string().trim().max(80).nullable(),
        age: z.number().int().min(0).max(120).nullable(),
        outside: z.boolean(),
        ticketTypeId: z.uuid().nullable(),
      }),
    )
    .min(1)
    .max(20),
});

// The receipt as base64 (no data: prefix), image or PDF up to 1.2 MB: the
// API checks the content.
export const receiptSchema = z.object({
  file: z
    .string()
    .max(1_700_000)
    .regex(/^[A-Za-z0-9+/]+={0,2}$/),
});

export const rejectOrderSchema = z.object({
  reason: z.string().trim().min(3).max(300),
});

export const cancelEventSchema = z.object({
  reason: z.string().trim().min(3).max(400),
});

export const attendeeIdSchema = z.uuid();
