import type {
  DependentRelationship,
  DependentStatus,
} from "@/shared/graphql/schema-enums";

export type { DependentRelationship, DependentStatus };

/** Someone of a resident's household who doesn't use the app. */
export type Dependent = {
  id: string;
  name: string;
  /** YYYY-MM-DD. */
  birthDate: string;
  relationship: DependentRelationship;
  status: DependentStatus;
  /** The resident who registered it (for the managers). */
  holderName: string | null;
  unitLabel: string | null;
  rejectReason: string | null;
  reviewedAt: string | null;
  createdAt: string;
  /** Short-lived link to the document. */
  documentUrl: string;
  documentContentType: string;
};

export type DependentInput = {
  name: string;
  birthDate: string;
  relationship: DependentRelationship;
  /** Base64 (no data: prefix): image or PDF. */
  document: string;
};
