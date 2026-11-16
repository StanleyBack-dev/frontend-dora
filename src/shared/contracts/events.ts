import type {
  AttendeeSource,
  EventOrderStatus,
  EventPixSource,
  EventSalesClose,
  EventStatus,
  PixKeyType,
  TicketEntryWindow,
  TicketKind,
  TicketPassStatus,
  TicketPriceMode,
} from "@/shared/graphql/schema-enums";

export type {
  AttendeeSource,
  EventOrderStatus,
  EventPixSource,
  EventSalesClose,
  EventStatus,
  PixKeyType,
  TicketEntryWindow,
  TicketKind,
  TicketPassStatus,
  TicketPriceMode,
};

/** Who receives a PIX (key type, key, receiver name and city). */
export type PixReceiver = {
  keyType: PixKeyType;
  key: string;
  name: string;
  city: string;
};

/** An audience an event accepts (fixed list) and what it pays. */
export type TicketType = {
  id: string;
  kind: TicketKind;
  /** The audience's label ("Criança"). */
  name: string;
  priceMode: TicketPriceMode;
  /** With CUSTOM: the value. */
  customPriceCents: number | null;
  /** What it costs (from the full price); 0: free. */
  priceCents: number;
  /** Age range, both ends included (null: any age). */
  minAge: number | null;
  maxAge: number | null;
};

export type TicketTypeInput = Omit<TicketType, "id" | "name" | "priceCents"> & {
  id: string | null;
};

/** Where an event outside the condominium happens. */
export type EventAddress = {
  /** 8 digits. */
  zip: string;
  street: string;
  /** "123" or "S/N". */
  number: string;
  complement: string | null;
  district: string;
  city: string;
  /** UF. */
  state: string;
};

/** A condominium event (module contracted apart). */
export type CondominiumEvent = {
  id: string;
  title: string;
  description: string | null;
  spaceId: string | null;
  spaceName: string | null;
  /** With a space, a detail; outside, the name of the place. */
  location: string | null;
  /** Outside the condominium (null with a space). */
  address: EventAddress | null;
  startsAt: string;
  endsAt: string;
  capacity: number;
  /** Guests from outside the condominium (0: residents only). */
  externalGuestLimit: number;
  /** Entry with a paid ticket (PIX); otherwise a free ticket. */
  ticketed: boolean;
  /** Inteira (null without tickets). */
  fullPriceCents: number | null;
  ticketTypes: TicketType[];
  /** Most tickets per unit (null: no limit). */
  unitTicketLimit: number | null;
  /** When orders stop: some hours before the start, or at the end. */
  salesClose: EventSalesClose;
  /** BEFORE_START: how many hours before (0: at the start). */
  salesCloseHours: number;
  /** The moment orders stop (computed by the API). */
  salesClosesAt: string;
  /** Ticketed: the condominium's PIX or the event's own. */
  pixSource: EventPixSource | null;
  customPix: PixReceiver | null;
  /** Places still free (in total, and for guests from outside). */
  placesLeft: number;
  outsidePlacesLeft: number;
  status: EventStatus;
  cancelReason: string | null;
  publishedAt: string | null;
  cancelledAt: string | null;
  createdAt: string;
};

export type EventInput = {
  title: string;
  description: string | null;
  spaceId: string | null;
  location: string | null;
  /** Required without a space. */
  address: EventAddress | null;
  startsAt: string;
  endsAt: string;
  capacity: number;
  externalGuestLimit: number;
  ticketed: boolean;
  fullPriceCents: number | null;
  ticketTypes: TicketTypeInput[];
  unitTicketLimit: number | null;
  salesClose: EventSalesClose;
  salesCloseHours: number;
  pixSource: EventPixSource | null;
  customPix: PixReceiver | null;
};

/** One person of an order. */
export type Attendee = {
  id: string;
  /** The buyer, a dependent or someone else. */
  source: AttendeeSource;
  /** DEPENDENT: which one. */
  dependentId: string | null;
  name: string;
  age: number;
  /** From outside the condominium. */
  outside: boolean;
  /** The ticket type as it was when ordered (null: free event). */
  ticketName: string | null;
  priceCents: number;
  /** The ticket needs this person's document. */
  needsProof: boolean;
  /** Short-lived link to the document sent (null: none yet). */
  proofUrl: string | null;
  proofContentType: string | null;
  /** The ticket's code (QR), once the order is confirmed (null: not yet). */
  ticketCode: string | null;
  /** When the gate let this person in. */
  checkedInAt: string | null;
};

export type AttendeeInput = {
  source: AttendeeSource;
  /** DEPENDENT: which one. */
  dependentId: string | null;
  /** GUEST: typed. */
  name: string | null;
  age: number | null;
  /** GUEST: from outside the condominium. */
  outside: boolean;
  ticketTypeId: string | null;
};

/** A member's order of tickets (or free registration) for an event. */
export type EventOrder = {
  id: string;
  eventId: string;
  eventTitle: string;
  /** Short code, also the PIX reference. */
  code: string;
  status: EventOrderStatus;
  totalCents: number;
  buyerName: string | null;
  unitLabel: string | null;
  attendees: Attendee[];
  /** Who receives (null: free order). */
  pix: PixReceiver | null;
  /** PIX "copia e cola" with the amount (only while unpaid). */
  pixCode: string | null;
  /** Unpaid: until when the places are held. */
  expiresAt: string | null;
  receiptSentAt: string | null;
  receiptContentType: string | null;
  /** Short-lived link to the receipt. */
  receiptUrl: string | null;
  reviewedAt: string | null;
  rejectReason: string | null;
  cancelledAt: string | null;
  createdAt: string;
};

/** Which events to list. */
export type EventWhen = "UPCOMING" | "PAST";

/** A ticket on the gate's list (Portaria). */
export type GateEventTicket = {
  /** The person of the order. */
  id: string;
  name: string;
  age: number;
  outside: boolean;
  source: AttendeeSource;
  ticketName: string | null;
  ticketCode: string;
  checkedInAt: string | null;
  entryWindow: TicketEntryWindow;
  eventId: string;
  eventTitle: string;
  eventStatus: EventStatus;
  startsAt: string;
  endsAt: string;
  /** The space or the place of the event. */
  placeName: string;
  orderCode: string;
  buyerName: string | null;
  unitLabel: string | null;
};

/** A ticket's public page. */
export type EventTicketPass = {
  code: string;
  name: string;
  ticketName: string | null;
  eventTitle: string;
  placeName: string;
  condominiumName: string;
  startsAt: string;
  endsAt: string;
  buyerFirstName: string | null;
  status: TicketPassStatus;
  checkedIn: boolean;
};
