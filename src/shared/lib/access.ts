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

/** Permissions that open the management area (Gestão) of a condominium. */
export const MANAGE_AREA_PERMISSIONS: Permission[] = [
  "DASHBOARD_READ",
  "NOTIFICATIONS_BROADCAST",
  "USERS_MANAGE",
  "UNITS_MANAGE",
  "SPACES_MANAGE",
  "BOOKINGS_MANAGE",
  "EVENTS_MANAGE",
  "PAYMENTS_MANAGE",
];

/** Manages the condominium they are working in (Gestão). */
export function canManageHere(
  user: Pick<SessionUser, "permissions" | "condominium">,
): boolean {
  return user.condominium !== null && canAny(user, ...MANAGE_AREA_PERMISSIONS);
}

/** Runs the platform (Plataforma): every condominium. */
export function canRunPlatform(
  user: Pick<SessionUser, "permissions">,
): boolean {
  return can(user, "CONDOMINIUMS_MANAGE");
}

/**
 * Roles `actor` may give to a member of the condominium (mirrors the API
 * rule: the platform assigns any role, a manager resident or gate staff).
 */
export function assignableGroups(actor: UserGroup): UserGroup[] {
  if (actor === "ADMIN_MASTER") return ["USER", "CONCIERGE", "ADMIN"];
  if (actor === "ADMIN") return ["USER", "CONCIERGE"];
  return [];
}

/**
 * A resident of the condominium they are working in (the Morador group,
 * with a membership there). Dependents are theirs only: managers, the gate
 * and the platform administrator (who opens any condominium without being
 * a member) have none.
 */
export function isResidentHere(
  user: Pick<SessionUser, "group" | "condominium" | "condominiums">,
): boolean {
  const current = user.condominium;
  return (
    user.group === "USER" &&
    current !== null &&
    user.condominiums.some((condominium) => condominium.id === current.id)
  );
}
