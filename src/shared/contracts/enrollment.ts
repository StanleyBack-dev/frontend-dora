import type { TemporaryAccess } from "@/shared/contracts/api";
import type { EnrollmentStatus } from "@/shared/graphql/schema-enums";

export type { EnrollmentStatus };

/** Code shared with a group of residents (one code, many answers). */
export type EnrollmentInvite = {
  id: string;
  code: string;
  label: string;
  expiresAt: string;
  revokedAt: string | null;
  createdAt: string;
  requestCount: number;
};

/** Public form data; also what the manager corrects before approving. */
export type EnrollmentData = {
  fullName: string;
  email: string;
  phone: string;
  /** Unit picked on the form (required when the condominium has units). */
  unitId?: string | null;
  /** Address detail inside the condominium ("casa dos fundos"). */
  unitComplement?: string | null;
  /** Typed when the condominium has no units registered yet. */
  unitBlock?: string | null;
  unitNumber?: string | null;
};

/** What the public form shows once the code is accepted. */
export type EnrollmentForm = {
  condominiumName: string;
  units: { id: string; label: string }[];
};

export type EnrollmentRequest = EnrollmentData & {
  id: string;
  unitLabel: string | null;
  unitComplement: string | null;
  /** Unit typed on the form (no units registered then): "Bloco A · 101". */
  typedUnitLabel: string | null;
  typedUnitBlock: string | null;
  typedUnitNumber: string | null;
  status: EnrollmentStatus;
  createdAt: string;
  reviewedAt: string | null;
  rejectionReason: string | null;
  userId: string | null;
  /** Short-lived link to the profile photo sent with the sign-up. */
  photoUrl: string | null;
};

export type EnrollmentApproval = {
  request: EnrollmentRequest;
  access: TemporaryAccess;
};
