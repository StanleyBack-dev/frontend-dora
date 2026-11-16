import "server-only";
import { z } from "zod";

export const dependentIdSchema = z.uuid();

// Shape only: the API checks the content (name, date, the document).
export const dependentInputSchema = z.object({
  name: z.string().trim().min(1).max(80),
  birthDate: z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/),
  relationship: z.enum([
    "CHILD",
    "SPOUSE",
    "PARENT",
    "SIBLING",
    "GRANDCHILD",
    "OTHER",
  ]),
  document: z
    .string()
    .max(1_700_000)
    .regex(/^[A-Za-z0-9+/]+={0,2}$/),
});

export const rejectDependentSchema = z.object({
  reason: z.string().trim().min(3).max(300),
});
