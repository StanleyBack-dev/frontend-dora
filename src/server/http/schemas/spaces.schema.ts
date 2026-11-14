import "server-only";
import { z } from "zod";

export const spaceIdSchema = z.uuid();

const time = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$|^24:00$/);
const int = z.number().int();

// Shape only: the API owns the ranges and the messages people see.
export const spaceInputSchema = z.object({
  name: z.string().trim().min(1).max(200),
  kind: z.enum([
    "COURT",
    "PARTY_ROOM",
    "BARBECUE",
    "POOL",
    "GYM",
    "GAME_ROOM",
    "OTHER",
  ]),
  description: z.string().max(2000).nullable(),
  capacity: int.nullable(),
  usageRules: z.string().max(6000).nullable(),
  rules: z.object({
    openingHours: z
      .array(
        z.object({
          weekday: int.min(0).max(6),
          opensAt: time,
          closesAt: time,
        }),
      )
      .max(7),
    slotMinutes: int,
    minAdvanceHours: int,
    maxAdvanceDays: int,
    unitLimit: z
      .object({ count: int, period: z.enum(["DAY", "WEEK", "MONTH"]) })
      .nullable(),
    requiresApproval: z.boolean(),
    cancelUntilHours: int,
  }),
});

export const spaceActiveSchema = z.object({ active: z.boolean() });
