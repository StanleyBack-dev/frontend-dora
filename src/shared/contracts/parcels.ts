// Parcels (encomendas): contract types shared by the BFF routes and the UI.
// Dates are ISO strings.
import type {
  DocumentType,
  ParcelStatus,
  SignatureLocationStatus,
} from "@/shared/graphql/schema-enums";

export type { ParcelStatus, SignatureLocationStatus };

/** A parcel received for a unit. */
export type Parcel = {
  id: string;
  unitId: string | null;
  /** "Bloco A · 101" (null: the unit was removed). */
  unitLabel: string | null;
  recipientName: string | null;
  /** Registered for one resident by name: only they are told and see it. */
  recipientOnly: boolean;
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
};

/** Filters of the condominium's parcels (absent: any). */
export type ParcelFilter = {
  statuses?: ParcelStatus[];
  unitId?: string;
  search?: string;
  /** ISO instants: received on or after / before. */
  from?: string;
  to?: string;
};

/** The condominium's parcels at a glance, and the units for the filter. */
export type ParcelOverview = {
  byStatus: { status: ParcelStatus; count: number }[];
  /** Waiting for pickup longer than the reminder (3 days). */
  waitingLong: number;
  units: { id: string; label: string }[];
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
};

/** One point of a drawn signature: x, y, ms since the start, pressure. */
export type SignaturePoint = [number, number, number, number];

/** The signature as drawn on a canvas of this size (CSS pixels). */
export type SignatureDrawing = {
  width: number;
  height: number;
  strokes: SignaturePoint[][];
};

export type SignatureLocation = {
  status: SignatureLocationStatus;
  latitude?: number | null;
  longitude?: number | null;
  accuracyMeters?: number | null;
};

export type SignatureDevice = {
  platform?: string | null;
  language?: string | null;
  screenWidth?: number | null;
  screenHeight?: number | null;
  pixelRatio?: number | null;
  /** "touch", "pen" or "mouse". */
  pointerType?: string | null;
  maxTouchPoints?: number | null;
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
