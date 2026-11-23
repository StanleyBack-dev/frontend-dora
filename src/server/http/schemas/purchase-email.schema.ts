import "server-only";
import { z } from "zod";

/** A purchase document by e-mail: 1 to 5 addresses and the message. */
export const purchaseEmailSchema = z.object({
  emails: z.array(z.email().max(254)).min(1).max(5),
  message: z.string().trim().min(1).max(1000),
});
