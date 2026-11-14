import type {
  BookingStatus,
  BookingWhen,
  SlotState,
  SpaceKind,
} from "@/shared/graphql/schema-enums";

export type { BookingStatus, BookingWhen, SlotState };

export type Booking = {
  id: string;
  spaceId: string;
  spaceName: string;
  spaceKind: SpaceKind;
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
