import "server-only";
import { z } from "zod";
import { idSchema, optionalText } from "@/server/http/schemas/fields";

/**
 * Request shapes of the quotes routes. Shapes only: the API checks every
 * value again (the request's items, prices, the file).
 */

export const purchaseQuoteIdSchema = idSchema;

const cents = z.number().int().min(0).max(10_000_000_000);
const base64File = z
  .string()
  .max(1_700_000)
  .regex(/^[A-Za-z0-9+/]+={0,2}$/);

const quoteTerms = {
  items: z
    .array(
      z.object({
        requestItemId: idSchema,
        unitPriceCents: cents.nullable(),
      }),
    )
    .min(1)
    .max(50),
  shippingCents: cents.nullable(),
  charges: z
    .array(
      z.object({
        label: z.string().trim().min(2).max(60),
        amountCents: cents,
      }),
    )
    .max(10),
  discountCents: cents.nullable(),
  discountPercentBp: z.number().int().min(1).max(10_000).nullable(),
  interestRateBp: z.number().int().min(1).max(2000).nullable(),
  deliveryDays: z.number().int().min(0).max(365).nullable(),
  paymentMethod: z
    .enum([
      "PIX",
      "CASH",
      "DEBIT_CARD",
      "CREDIT_CARD",
      "BOLETO",
      "BANK_TRANSFER",
      "INVOICE",
      "OTHER",
    ])
    .nullable(),
  installments: z.number().int().min(1).max(60).nullable(),
  paymentTerms: optionalText(120),
  validUntil: z.iso
    .date()
    .nullish()
    .transform((value) => value ?? null),
  notes: optionalText(500),
};

export const addPurchaseQuoteSchema = z.object({
  supplierId: idSchema,
  ...quoteTerms,
  file: base64File.nullish().transform((value) => value ?? null),
});

export const updatePurchaseQuoteSchema = z.object({
  ...quoteTerms,
  /** A new document; null with removeFile drops it; absent keeps it. */
  file: base64File.nullish().transform((value) => value ?? null),
  removeFile: z.boolean().default(false),
});

export const choosePurchaseQuoteSchema = z.object({
  justification: optionalText(300),
});
