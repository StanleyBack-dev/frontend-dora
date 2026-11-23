import "server-only";
import { z } from "zod";
import { optionalText } from "@/server/http/schemas/fields";

/** How purchases are approved (as the API: the limit with LIMIT). */
export const purchaseSettingsSchema = z
  .object({
    approvalMode: z.enum(["ALWAYS", "LIMIT"]),
    approvalLimitCents: z.number().int().min(1).max(100_000_000_000).nullable(),
  })
  .refine(
    (value) =>
      value.approvalMode === "ALWAYS" || value.approvalLimitCents !== null,
    { message: "Informe o valor da alçada.", path: ["approvalLimitCents"] },
  );

export const approvePurchaseSchema = z.object({ note: optionalText(300) });

export const decisionReasonSchema = z.object({
  reason: z.string().trim().min(3).max(300),
});
