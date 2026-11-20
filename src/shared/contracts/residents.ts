import type { DependentRelationship } from "@/shared/contracts/dependents";

/** A resident in the gate's read-only directory (no e-mail or documents). */
export type ResidentListing = {
  userId: string;
  name: string;
  /** Short-lived link to the profile photo. */
  photoUrl: string | null;
  unitId: string | null;
  /** "Bloco A · 101". */
  unitLabel: string | null;
  unitComplement: string | null;
  /** Digits only. */
  phone: string | null;
  /** Approved dependents (no birth date). */
  dependents: {
    id: string;
    name: string;
    relationship: DependentRelationship;
  }[];
};

export type ResidentsFilter = { userId?: string; unitId?: string };
