// An on-screen signature (parcels, lost and found): what the device sends
// with it and the receipt the API keeps. Dates are ISO strings.
import type {
  DocumentType,
  SignatureLocationStatus,
} from "@/shared/graphql/schema-enums";

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

/** A signed receipt: the signature and the evidence that backs it. */
export type SignatureReceipt = {
  signerName: string;
  signerDocumentType: DocumentType | null;
  /** "***.456.789-**" */
  signerDocumentMasked: string | null;
  /** The declaration signed, as it was shown. */
  declaration: string;
  /** Short-lived link to the signature image. */
  imageUrl: string;
  imageSha256: string;
  strokesSha256: string;
  /** Server time (ISO). */
  signedAt: string;
  /** The device's time (ISO) and time zone. */
  clientSignedAt: string | null;
  clientTimeZone: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  /** JSON: screen, touch/pen, language… */
  device: string;
  locationStatus: SignatureLocationStatus;
  latitude: number | null;
  longitude: number | null;
  locationAccuracyMeters: number | null;
  collectedByName: string;
  /** CONCIERGE, ADMIN or ADMIN_MASTER. */
  collectedByRole: string;
  evidenceSha256: string;
  /** The stored evidence still matches its digest. */
  intact: boolean;
};
