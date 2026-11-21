// Lost and found (achados e perdidos): contract types shared by the BFF
// routes and the UI. Dates are ISO strings.
import type {
  DocumentType,
  FoundItemCategory,
  FoundItemClaimStatus,
  FoundItemStatus,
} from "@/shared/graphql/schema-enums";
import type {
  SignatureDevice,
  SignatureLocation,
  SignatureReceipt,
} from "@/shared/contracts/signature";

export type { FoundItemCategory, FoundItemClaimStatus, FoundItemStatus };

/** An item found in the condominium. */
export type FoundItem = {
  id: string;
  category: FoundItemCategory;
  /** What it is ("chave com chaveiro azul"). */
  title: string;
  /** What the residents see about it. */
  description: string | null;
  foundLocation: string;
  foundAt: string;
  storageLocation: string;
  /** The photo is not shown to the residents. */
  photoHidden: boolean;
  status: FoundItemStatus;
  registeredByName: string | null;
  /** Kept until (then donated or discarded). */
  keepUntil: string;
  /** Returned, donated or discarded at. */
  closedAt: string | null;
  closedByName: string | null;
  /** Why it was donated or discarded. */
  closeReason: string | null;
  /** The resident it went back to (by their claim). */
  returnedToName: string | null;
  /** Who signed the return. */
  signerName: string | null;
  /** Claims waiting for the desk. */
  pendingClaims: number;
  /** Short-lived link to the photo. */
  photoUrl: string | null;
};

/** A resident saying an item is theirs. */
export type FoundItemClaim = {
  id: string;
  itemId: string;
  itemTitle: string;
  itemStatus: FoundItemStatus;
  itemCategory: FoundItemCategory;
  userId: string;
  userName: string;
  unitLabel: string | null;
  /** How the resident described the item. */
  message: string;
  status: FoundItemClaimStatus;
  createdAt: string;
  decidedAt: string | null;
  decidedByName: string | null;
  /** The desk's note (the reason, when rejected). */
  decisionNote: string | null;
};

/** One item as the desk sees it: private details, claims and the receipt. */
export type FoundItemDetails = FoundItem & {
  /** Details to check the owner (desk only). */
  privateDetails: string | null;
  claims: FoundItemClaim[];
  /** The text after "Eu, <nome>, " (null: no longer kept). */
  returnDeclaration: string | null;
  returnReceipt: SignatureReceipt | null;
};

/** Filters of the condominium's found items (absent: any). */
export type FoundItemFilter = {
  statuses?: FoundItemStatus[];
  category?: FoundItemCategory;
  /** Part of what it is, the description or where it was found. */
  search?: string;
  /** Only the items with claims waiting. */
  withPendingClaims?: boolean;
};

/** The condominium's found items at a glance. */
export type FoundItemOverview = {
  byStatus: { status: FoundItemStatus; count: number }[];
  /** Claims waiting for the desk. */
  pendingClaims: number;
  /** Kept items whose keeping period ends within 7 days. */
  expiringSoon: number;
};

export type RegisterFoundItemInput = {
  category: FoundItemCategory;
  title: string;
  description?: string | null;
  privateDetails?: string | null;
  foundLocation: string;
  /** ISO (absent: now). */
  foundAt?: string | null;
  storageLocation: string;
  /** Base64 (no data: prefix). */
  photo?: string | null;
  /** Absent: hidden only for documents. */
  photoHidden?: boolean | null;
};

/** The return: who takes it, the claim it answers and the signature. */
export type ReturnFoundItemInput = {
  /** The accepted claim it answers (null: no claim). */
  claimId?: string | null;
  signerName: string;
  signerDocumentType?: DocumentType | null;
  signerDocument?: string | null;
  /** The declaration as shown (the API checks it is still the same). */
  declarationShown: string;
  /** Base64 PNG of the signature (no data: prefix). */
  signatureImage: string;
  /** JSON of a SignatureDrawing. */
  signatureDrawing: string;
  clientSignedAt?: string | null;
  clientTimeZone?: string | null;
  location: SignatureLocation;
  device?: SignatureDevice | null;
};
