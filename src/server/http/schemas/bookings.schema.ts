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
