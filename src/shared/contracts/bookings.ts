import type {
  BookingStatus,
  BookingWhen,
  DocumentType,
  GuestCheckInWindow,
  GuestInviteStatus,
  SlotState,
  SpaceKind,
} from "@/shared/graphql/schema-enums";

export type {
  BookingStatus,
  BookingWhen,
  DocumentType,
  GuestCheckInWindow,
  GuestInviteStatus,
  SlotState,
};

export type Booking = {
  id: string;
  spaceId: string;
  spaceName: string;
  spaceKind: SpaceKind;
  /** The space takes a guest list. */
  guestsAllowed: boolean;
  userId: string;
  userName: string;
  /** "Bloco A · 101". */
  unitLabel: string | null;
  startsAt: string;
  endsAt: string;
  status: BookingStatus;
  notes: string | null;
  /** Last moment the booker can cancel. */
  cancelUntil: string;
  /** Why the administration rejected or cancelled it. */
  reason: string | null;
  decidedAt: string | null;
  cancelledAt: string | null;
  cancelledByManager: boolean;
  /** Usage fee kept when booking, in cents (null: free). */
  feeCents: number | null;
  /** When the fee went to the condominium's billing. */
  feeBilledAt: string | null;
  /** The weekly series it belongs to (null: single booking). */
  seriesId: string | null;
  createdAt: string;
};

export type AvailabilitySlot = {
  startsAt: string;
  endsAt: string;
  state: SlotState;
  bookingId: string | null;
  bookingStatus: BookingStatus | null;
  /** Who holds it (managers) or why it is blocked. */
  label: string | null;
  /** The viewer is on this slot's waiting list. */
  waitlisted: boolean;
};

export type SpaceAvailability = {
  spaceId: string;
  /** YYYY-MM-DD. */
  date: string;
  firstDate: string;
  lastDate: string;
  slots: AvailabilitySlot[];
};

export type SpaceBlock = {
  id: string;
  spaceId: string;
  startsAt: string;
  endsAt: string;
  reason: string;
  createdByName: string | null;
  createdAt: string;
};

export type SpaceBlockInput = {
  startsAt: string;
  endsAt: string;
  reason: string;
  cancelOverlapping: boolean;
};

/** Someone the booker brings; the code is what the gate checks. */
export type BookingGuest = {
  id: string;
  bookingId: string;
  name: string;
  /** CPF or RG (null: no document). */
  documentType: DocumentType | null;
  /** Digits only (an RG may end in "X"). */
  document: string | null;
  /** Digits only. */
  phone: string | null;
  /** The guest's invite code (what the QR carries). */
  code: string;
  checkedInAt: string | null;
  createdAt: string;
};

export type GuestInput = {
  name: string;
  documentType: DocumentType | null;
  document: string | null;
  phone: string | null;
};

/** A guest on the gate's list (Portaria). */
export type GateGuest = Omit<BookingGuest, "createdAt"> & {
  spaceName: string;
  startsAt: string;
  endsAt: string;
  hostName: string;
  unitLabel: string | null;
  checkInWindow: GuestCheckInWindow;
};

/** The public invite page of one guest. */
export type GuestInvite = {
  code: string;
  guestName: string;
  hostFirstName: string;
  spaceName: string;
  condominiumName: string;
  startsAt: string;
  endsAt: string;
  status: GuestInviteStatus;
  checkedIn: boolean;
};

export type BookingSeriesResult = {
  seriesId: string;
  created: Booking[];
  skipped: { startsAt: string; reason: string }[];
};

export type SeriesCancellation = { cancelled: number; kept: number };

/** Usage fees of a month, for the condominium's billing. */
export type BookingFees = {
  /** YYYY-MM. */
  month: string;
  items: Booking[];
  totalCents: number;
  billedCents: number;
};
