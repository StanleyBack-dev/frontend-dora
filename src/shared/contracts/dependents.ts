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

/** What narrows the managers' list of dependents (absent: any). */
export type DependentReviewFilter = {
  status?: DependentStatus;
  dependentId?: string;
  /** The resident who registered it (user id). */
  holderId?: string;
  unitId?: string;
  relationship?: DependentRelationship;
};

/** Something to pick in a filter of the dependents. */
export type DependentFilterOption = { id: string; label: string };

/** The dependents at a glance: counts by status and the filter options. */
export type DependentReviewOverview = {
  pending: number;
  approved: number;
  rejected: number;
  dependents: DependentFilterOption[];
  holders: DependentFilterOption[];
  units: DependentFilterOption[];
};
