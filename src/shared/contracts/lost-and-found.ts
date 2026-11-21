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
  /** Whose accepted claim it waits for (desk only; null: none). */
  awaitedByName: string | null;
  /** Short-lived link to the photo. */
  photoUrl: string | null;
  /**
   * Reserved by the desk for this unit (only its residents see it) or this
   * resident of it (only them); null: anyone may claim it.
   */
  ownerUnitLabel: string | null;
  ownerName: string | null;
};

/** A resident saying an item is theirs (checked in person at the handover). */
export type FoundItemClaim = {
  id: string;
  itemId: string;
  itemTitle: string;
  itemStatus: FoundItemStatus;
  itemCategory: FoundItemCategory;
  userId: string;
  userName: string;
  unitLabel: string | null;
  /** What the resident added about the item (optional). */
  message: string | null;
  status: FoundItemClaimStatus;
  createdAt: string;
  decidedAt: string | null;
  decidedByName: string | null;
  /** The desk's note (the reason, when rejected). */
  decisionNote: string | null;
};

/** A claim in the desk's queue, with its item (and the private details). */
export type QueuedFoundItemClaim = FoundItemClaim & {
  item: FoundItem & { privateDetails: string | null };
};

/** A kept item as a resident sees it, with their own latest claim. */
export type KeptFoundItem = FoundItem & {
  myClaim: FoundItemClaim | null;
};

/**
 * One item with what the caller may see: the desk gets the private details
 * and the claims; the receipt goes to the desk and to whoever it went back
 * to.
 */
export type FoundItemDetails = KeptFoundItem & {
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
  /** Exactly these (from the filter lists). */
  title?: string;
  foundLocation?: string;
  storageLocation?: string;
  /** Reserved for this resident, or claimed by them. */
  residentId?: string;
};

/** The condominium's found items at a glance. */
export type FoundItemOverview = {
  byStatus: { status: FoundItemStatus; count: number }[];
  /** Claims waiting for the desk. */
  pendingClaims: number;
  /** Kept items whose keeping period ends within 7 days. */
  expiringSoon: number;
  /** The values in use, for the filter lists (most recent first). */
  titles: string[];
  foundLocations: string[];
  storageLocations: string[];
  /** Residents an item was reserved for or who claimed one. */
  residents: { id: string; name: string }[];
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
  /** Whose the desk knows it is: a unit (its residents are told)… */
  ownerUnitId?: string | null;
  /** …or one of its residents (only them, with an accepted claim). */
  ownerUserId?: string | null;
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
