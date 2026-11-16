import type { MemberKind, UserGroup } from "@/shared/contracts/api";

export const KIND_LABELS: Record<MemberKind, string> = {
  RESIDENT: "Morador",
  EMPLOYEE: "Funcionário",
};

/**
 * The roles that fit each tie: a resident is a plain resident or a resident
 * síndico (Gestor); an employee works at the gate or runs the condominium
 * (a hired síndico or administrator).
 */
export const ROLES_BY_KIND: Record<MemberKind, readonly UserGroup[]> = {
  RESIDENT: ["USER", "ADMIN"],
  EMPLOYEE: ["CONCIERGE", "ADMIN"],
};

/** The roles of this tie the manager may assign, in the tie's order. */
export const rolesFor = (
  kind: MemberKind,
  assignable: readonly UserGroup[],
): UserGroup[] =>
  ROLES_BY_KIND[kind].filter((group) => assignable.includes(group));
