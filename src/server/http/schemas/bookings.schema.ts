import "server-only";
import { z } from "zod";

export const bookingIdSchema = z.uuid();

const instant = z.iso.datetime({ offset: true });

export const createBookingSchema = z.object({
  spaceId: z.uuid(),
  startsAt: instant,
  notes: z.string().trim().max(600).nullable(),
});

export const bookingReasonSchema = z.object({
  reason: z.string().trim().max(600).nullable(),
});

export const availabilityQuerySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export const spaceBlockSchema = z.object({
  startsAt: instant,
  endsAt: instant,
  reason: z.string().trim().min(1).max(400),
  cancelOverlapping: z.boolean(),
});

export const bookingSeriesSchema = z.object({
  spaceId: z.uuid(),
  startsAt: instant,
  weeks: z.number().int().min(2).max(26),
  notes: z.string().trim().max(600).nullable(),
});

export const waitlistSlotSchema = z.object({
  spaceId: z.uuid(),
  startsAt: instant,
});

// Shape only: the API trims and checks the content.
export const bookingGuestsSchema = z.object({
  guests: z
    .array(
      z.object({
        name: z.string().trim().min(1).max(240),
        documentType: z.enum(["CPF", "RG"]).nullable(),
        document: z.string().trim().max(60).nullable(),
        phone: z.string().trim().max(30).nullable(),
      }),
    )
    .min(1)
    .max(100),
});

export const guestCodeSchema = z
  .string()
  .trim()
  .regex(/^[A-Za-z0-9-]{4,20}$/);

export const checkInSchema = z
  .object({
    guestId: z.uuid().nullish(),
    code: guestCodeSchema.nullish(),
  })
  .refine((value) => Boolean(value.guestId || value.code));

export const gateDateSchema = z.object({
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
});

export const feesMonthSchema = z.object({
  month: z
    .string()
    .regex(/^\d{4}-(0[1-9]|1[0-2])$/)
    .optional(),
});

export const feesBilledSchema = z.object({
  bookingIds: z.array(z.uuid()).max(500),
  billed: z.boolean(),
});
