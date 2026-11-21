// Parcels (encomendas): contract types shared by the BFF routes and the UI.
// Dates are ISO strings.
import type {
  DocumentType,
  ParcelStatus,
  SignatureLocationStatus,
} from "@/shared/graphql/schema-enums";
import type {
  SignatureDevice,
  SignatureLocation,
  SignatureReceipt,
} from "@/shared/contracts/signature";

export type { ParcelStatus, SignatureLocationStatus };
export type {
  SignatureDevice,
  SignatureDrawing,
  SignatureLocation,
  SignaturePoint,
} from "@/shared/contracts/signature";

/** A parcel received for a unit. */
export type Parcel = {
  id: string;
  unitId: string | null;
  /** "Bloco A · 101" (null: the unit was removed). */
  unitLabel: string | null;
  recipientName: string | null;
  /** Registered for one resident by name: only they are told and see it. */
  recipientOnly: boolean;
  /** Someone a resident authorized to pick it up (null: none). */
  authorizedName: string | null;
  /** "CPF ***.456.789-**" */
  authorizedDocumentMasked: string | null;
  authorizedByName: string | null;
  authorizedAt: string | null;
  /** Perishable: picked up by `pickupDeadline` (ISO). */
  perishable: boolean;
  pickupDeadline: string | null;
  carrier: string | null;
  trackingCode: string | null;
  notes: string | null;
  /** Where it is kept (shelf, cabinet, administration…). */
  storageLocation: string | null;
  /** Shown by residents (typed, or in the QR) to pick it up. */
  pickupCode: string;
  status: ParcelStatus;
  receivedAt: string;
  receivedByName: string | null;
  /** Picked up, returned or cancelled at. */
  closedAt: string | null;
  closedByName: string | null;
  closeReason: string | null;
  /** Who signed the pickup. */
  signerName: string | null;
  /** Short-lived link to the photo. */
  photoUrl: string | null;
};

/** A parcel found by its code, with the declaration to sign. */
export type ParcelToHandOver = Parcel & {
  /** The text after "Eu, <nome>, " (null: no longer waiting). */
  pickupDeclaration: string | null;
  /** The authorized person's full document (desk only), to fill the form. */
  authorizedDocumentType: "CPF" | "RG" | null;
  authorizedDocument: string | null;
};

/** Filters of the condominium's parcels (absent: any). */
export type ParcelFilter = {
  statuses?: ParcelStatus[];
  unitId?: string;
  search?: string;
  /** Exactly these (from the filter lists). */
  recipientName?: string;
  carrier?: string;
  trackingCode?: string;
  /** Only the perishable ones. */
  perishable?: boolean;
  /** ISO instants: received on or after / before. */
  from?: string;
  to?: string;
};

/** The condominium's parcels at a glance, and the units for the filter. */
export type ParcelOverview = {
  byStatus: { status: ParcelStatus; count: number }[];
  /** Waiting for pickup longer than the reminder (3 days). */
  waitingLong: number;
  /** Perishable parcels waiting, and those past their deadline. */
  perishableWaiting: number;
  perishableOverdue: number;
  units: { id: string; label: string }[];
  /** The values used, for the filter lists (most recent first). */
  recipientNames: string[];
  carriers: string[];
  trackingCodes: string[];
};

export type RegisterParcelInput = {
  unitId: string;
  recipientName?: string | null;
  /** Chosen by name: only this resident is told and sees it. */
  recipientUserId?: string | null;
  carrier?: string | null;
  trackingCode?: string | null;
  notes?: string | null;
  storageLocation?: string | null;
  /** Base64 (no data: prefix). */
  photo?: string | null;
  /** Food, medicine, flowers…: picked up within `perishableHours`. */
  perishable?: boolean | null;
  perishableHours?: number | null;
};

/** The handover: the code, who picks it up and the signature's evidence. */
export type PickUpParcelInput = {
  code: string;
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

/** A resident (with the unit) to register a parcel by name. */
export type ParcelRecipient = {
  userId: string;
  name: string;
  unitId: string;
  unitLabel: string;
};

/** The pickup receipt: the signature and the evidence that backs it. */
export type ParcelReceipt = SignatureReceipt;

/** A parcel with its pickup receipt (null until picked up). */
export type ParcelWithReceipt = Parcel & { signature: ParcelReceipt | null };

/** Someone else allowed to pick up a parcel. */
export type AuthorizePickupInput = {
  name: string;
  documentType?: "CPF" | "RG" | null;
  document?: string | null;
};
