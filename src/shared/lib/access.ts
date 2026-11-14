import type {
  Permission,
  SessionUser,
  UserGroup,
} from "@/shared/contracts/api";

// UI-side permission checks. They only decide what to show; the API checks
// every operation again.
export function can(
  user: Pick<SessionUser, "permissions">,
  ...required: Permission[]
): boolean {
  return required.every((permission) => user.permissions.includes(permission));
}

export function canAny(
  user: Pick<SessionUser, "permissions">,
  ...options: Permission[]
): boolean {
  return options.some((permission) => user.permissions.includes(permission));
}

/** Permissions that open some part of the admin area. */
export const ADMIN_AREA_PERMISSIONS: Permission[] = [
  "USERS_MANAGE",
  "PERMISSIONS_MANAGE",
  "UNITS_MANAGE",
  "CONDOMINIUMS_MANAGE",
  "AUDIT_READ",
];

/**
 * Roles `actor` may give to a member of the condominium (mirrors the API
 * rule: the platform assigns resident or manager, a manager only resident).
 */
export function assignableGroups(actor: UserGroup): UserGroup[] {
  if (actor === "ADMIN_MASTER") return ["USER", "ADMIN"];
  if (actor === "ADMIN") return ["USER"];
  return [];
}
