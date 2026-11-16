import type { TemporaryAccess } from "@/shared/contracts/api";
import type {
  AddressFormat,
  EnrollmentApplicant,
  EnrollmentStatus,
} from "@/shared/graphql/schema-enums";

export type { EnrollmentApplicant, EnrollmentStatus };

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
  /** YYYY-MM-DD (required on the public form; null on older requests). */
  birthDate?: string | null;
  /** Unit picked on the form (required when the condominium has units). */
  unitId?: string | null;
  /** Address detail inside the condominium ("casa dos fundos"). */
  unitComplement?: string | null;
  /** Typed when the condominium has no units registered yet. */
  unitBlock?: string | null;
  unitNumber?: string | null;
  /** Houses: the street (the quadra goes in unitBlock, the lote in unitNumber). */
  unitStreet?: string | null;
};

/** What the public form shows once the code is accepted. */
export type EnrollmentForm = {
  condominiumName: string;
  /** Houses: street, quadra and lote are typed (no unit list). */
  addressFormat: AddressFormat;
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
  /** Houses: the street typed on the form. */
  typedUnitStreet: string | null;
  status: EnrollmentStatus;
  /** Resident or employee (employees have no unit nor address). */
  applicant: EnrollmentApplicant;
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
