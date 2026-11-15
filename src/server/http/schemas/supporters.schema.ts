import { z } from "zod";

// Shape only: the API checks names, amounts and dates (supporter.ts).
export const supporterIdSchema = z.uuid();

export const supportContributionSchema = z.object({
  name: z.string().trim().min(2).max(60),
  showName: z.boolean(),
  amountCents: z.number().int().min(1).max(10_000_000),
  receivedOn: z.iso.date(),
  note: z.string().trim().max(200).nullable(),
});

export const supporterSchema = z.object({
  name: z.string().trim().min(2).max(60),
  showName: z.boolean(),
});
