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
};

export type EnrollmentRequest = EnrollmentData & {
  id: string;
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
