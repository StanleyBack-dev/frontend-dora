import "server-only";
import { z } from "zod";
import { idSchema, optionalText } from "@/server/http/schemas/fields";

/**
 * Request shapes of the orders routes. Shapes only: the API checks every
 * value again (the days, what is left to arrive, the file).
 */

const day = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
const base64File = z
  .string()
  .max(1_700_000)
  .regex(/^[A-Za-z0-9+/]+={0,2}$/);
const file = base64File.nullish().transform((value) => value ?? null);

export const placeOrderSchema = z.object({
  expectedOn: day.nullish().transform((value) => value ?? null),
  firstDueOn: day,
  notes: optionalText(500),
});

export const receiptSchema = z.object({
  receivedOn: day,
  items: z
    .array(
      z.object({
        requestItemId: idSchema,
        quantity: z.number().min(0).max(1_000_000),
      }),
    )
    .min(1)
    .max(50),
  invoiceNumber: optionalText(40),
  invoiceCents: z
    .number()
    .int()
    .min(0)
    .max(10_000_000_000)
    .nullish()
    .transform((value) => value ?? null),
  invoiceDate: day.nullish().transform((value) => value ?? null),
  note: optionalText(300),
  file,
});

export const paymentSchema = z.object({
  paidOn: day,
  note: optionalText(300),
  file,
});

export const ratingSchema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: optionalText(300),
});

export const cancelOrderSchema = z.object({
  reason: z.string().trim().min(3).max(300),
  backToQuotes: z.boolean().default(false),
});

export const rescheduleSchema = z.object({ dueOn: day });
