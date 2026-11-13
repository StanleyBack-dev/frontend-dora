import "server-only";
import { z } from "zod";
import type { Permission, UserGroup } from "@/shared/contracts/api";

// Roles a member can have (the platform role is never assigned here).
const GROUPS = ["USER", "ADMIN"] as const satisfies readonly UserGroup[];

export const userIdSchema = z.uuid();

export const userGroupSchema = z.enum(GROUPS);

export const userInputSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.email().max(254),
  // Empty: the API derives the login from the name.
  username: z
    .string()
    .trim()
    .max(32)
    .transform((value) => value || null)
    .nullish(),
  group: userGroupSchema,
  // null: no unit (on update: remove it).
  unitId: z.uuid().nullish(),
});

// The API checks the value against its own enum; here it only has to look
// like one.
export const permissionSchema = z
  .string()
  .regex(/^[A-Z_]{3,64}$/)
  .transform((value) => value as Permission);
