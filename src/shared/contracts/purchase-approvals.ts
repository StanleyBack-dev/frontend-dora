import type {
  PurchaseApprovalDecision as ApprovalDecision,
  PurchaseApprovalMode as ApprovalMode,
} from "@/shared/graphql/schema-enums";

export type { ApprovalDecision, ApprovalMode };

/** How the condominium approves its purchases (the alçada). */
export type PurchaseSettings = {
  approvalMode: ApprovalMode;
  /** With LIMIT: up to this (cents) it is approved on choosing. */
  approvalLimitCents: number | null;
  /** null: never changed (the defaults). */
  updatedAt: string | null;
  updatedByName: string | null;
};

/** One decision on a purchase, as it was then. */
export type PurchaseApproval = {
  id: string;
  decision: ApprovalDecision;
  supplierName: string;
  totalCents: number;
  /** The limit in force (null: every purchase waited). */
  limitCents: number | null;
  /** The note (approved) or the reason (returned, rejected). */
  note: string | null;
  chosenByName: string | null;
  decidedByName: string | null;
  decidedAt: string;
};

/** The approvals page's cards. */
export type ApprovalOverview = {
  awaiting: number;
  approvedThisMonth: number;
  returnedThisMonth: number;
  rejectedThisMonth: number;
};
