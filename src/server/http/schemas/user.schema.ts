import "server-only";
import { z } from "zod";
import type { Permission, UserGroup } from "@/shared/contracts/api";

// Roles a member can have (the platform role is never assigned here).
const GROUPS = [
  "USER",
  "ADMIN",
  "CONCIERGE",
] as const satisfies readonly UserGroup[];

export const userIdSchema = z.uuid();

export const userGroupSchema = z.enum(GROUPS);

// "" or null: none. The API validates the content.
const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .transform((value) => value || null)
    .nullish();

// The staff record (employees). The API checks the hiring date.
const employeeSchema = z.object({
  jobTitle: optionalText(60),
  hiredOn: z
    .string()
    .regex(/^(\d{4}-\d{2}-\d{2})?$/)
    .transform((value) => value || null)
    .nullish(),
  workShift: optionalText(80),
  contractor: optionalText(120),
});

// No login field: the API makes it from the name.
export const userInputSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.email().max(254),
  group: userGroupSchema,
  kind: z.enum(["RESIDENT", "EMPLOYEE"]),
  employee: employeeSchema.nullish(),
  // null: no unit (on update: remove it).
  unitId: z.uuid().nullish(),
  // "" or null: none (on update: clear it). The API validates the content.
  unitComplement: z.string().trim().max(80).nullish(),
  phone: z.string().trim().max(30).nullish(),
});

// The API checks the value against its own enum; here it only has to look
// like one.
export const permissionSchema = z
  .string()
  .regex(/^[A-Z_]{3,64}$/)
  .transform((value) => value as Permission);
