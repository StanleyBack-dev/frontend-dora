import "server-only";
import { authed } from "@/server/auth/current-user";
import { dependentsService } from "@/server/services/dependents.service";
import type { Dependent, DependentStatus } from "@/shared/contracts/dependents";

/** The caller's dependents (any status). */
export function loadMyDependents(): Promise<Dependent[]> {
  return authed((token) => dependentsService.mine(token));
}

/** The condominium's dependents, for the managers. */
export function loadDependentsForReview(
  status: DependentStatus | null,
): Promise<Dependent[]> {
  return authed((token) => dependentsService.forReview(token, status));
}

/**
 * The caller's approved dependents (for an event order); none when the
 * caller has no membership here (e.g. the platform administrator).
 */
export async function loadApprovedDependents(): Promise<Dependent[]> {
  try {
    return (await loadMyDependents()).filter(
      (dependent) => dependent.status === "APPROVED",
    );
  } catch {
    return [];
  }
}
