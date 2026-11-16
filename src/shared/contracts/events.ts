import type { EventStatus } from "@/shared/graphql/schema-enums";

export type { EventStatus };

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
};

/** Which events to list. */
export type EventWhen = "UPCOMING" | "PAST";
