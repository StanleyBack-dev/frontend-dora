import { formatSlot } from "@/features/bookings/model/booking-labels";
import type { GateGuest } from "@/shared/contracts/bookings";
import type { GateEventTicket } from "@/shared/contracts/events";
import { formatTime } from "@/shared/lib/datetime";
import { formatDocument } from "@/shared/lib/identity-document";
import { formatPhone } from "@/shared/lib/masks";

// The gate's day as one agenda: every booking with guests and every event
// with tickets is an "occasion", in the order the gate needs them (entry
// open now first, then the next ones, then the ones that ended), each with
// its people (who still has to come in first).

/** When the entry is possible (same values for invites and tickets). */
export type EntryWindow = "OPEN" | "TOO_EARLY" | "FINISHED" | "CANCELLED";

/** Hours before the start when the entry opens (mirrors the API). */
const OPENS_HOURS_BEFORE = 3;

/** One person at the gate: a booking guest or an event ticket. */
export type GateEntry = {
  kind: "guest" | "ticket";
  id: string;
  name: string;
  /** Short marks beside the name ("12 anos", "De fora"). */
  tags: string[];
  /** Document, phone, ticket type, who ordered, code… */
  details: string[];
  checkedInAt: string | null;
  window: EntryWindow;
  /** When the entry opens (TOO_EARLY). */
  opensAt: string;
  /** Normalized text the search looks into. */
  haystack: string;
};

export type OccasionPhase = "NOW" | "UPCOMING" | "FINISHED" | "CANCELLED";

/** A booking (its guests) or an event (its tickets) of the day. */
export type GateOccasion = {
  key: string;
  kind: "booking" | "event";
  title: string;
  /** Who invited (bookings) or where it happens (events). */
  subtitle: string;
  slot: string;
  startsAt: string;
  phase: OccasionPhase;
  /** When the entry opens, for an upcoming occasion. */
  opensAt: string;
  entries: GateEntry[];
  total: number;
  inside: number;
};

export type GateFilters = {
  search: string;
  kind: "all" | "booking" | "event";
  status: "all" | "waiting" | "inside";
  /** One occasion's key, or "" for all. */
  occasion: string;
};

export const NO_FILTERS: GateFilters = {
  search: "",
  kind: "all",
  status: "all",
  occasion: "",
};

export const normalize = (value: string) =>
  value.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();

const opensAt = (startsAt: string) =>
  new Date(
    new Date(startsAt).getTime() - OPENS_HOURS_BEFORE * 3_600_000,
  ).toISOString();

function guestEntry(guest: GateGuest): GateEntry {
  return {
    kind: "guest",
    id: guest.id,
    name: guest.name,
    tags: [],
    details: [
      formatDocument(guest.documentType, guest.document),
      guest.phone ? formatPhone(guest.phone) : null,
      `Código ${guest.code}`,
    ].filter((item): item is string => Boolean(item)),
    checkedInAt: guest.checkedInAt,
    window: guest.checkInWindow,
    opensAt: opensAt(guest.startsAt),
    haystack: normalize(
      `${guest.name} ${guest.document ?? ""} ${guest.hostName} ${guest.unitLabel ?? ""} ${guest.code} ${guest.spaceName}`,
    ),
  };
}

function ticketEntry(ticket: GateEventTicket): GateEntry {
  return {
    kind: "ticket",
    id: ticket.id,
    name: ticket.name,
    tags: [`${ticket.age} anos`, ...(ticket.outside ? ["De fora"] : [])],
    details: [
      ticket.ticketName,
      ticket.source === "SELF"
        ? "Quem pediu"
        : `Pedido de ${ticket.buyerName ?? "morador"}`,
      ticket.unitLabel,
      `Código ${ticket.ticketCode}`,
    ].filter((item): item is string => Boolean(item)),
    checkedInAt: ticket.checkedInAt,
    window: ticket.entryWindow,
    opensAt: opensAt(ticket.startsAt),
    haystack: normalize(
      `${ticket.name} ${ticket.buyerName ?? ""} ${ticket.unitLabel ?? ""} ${ticket.ticketCode} ${ticket.orderCode} ${ticket.eventTitle}`,
    ),
  };
}

/** The occasion's moment, from its people's entry windows. */
function phaseOf(entries: GateEntry[]): OccasionPhase {
  if (entries.some((entry) => entry.window === "OPEN")) return "NOW";
  if (entries.some((entry) => entry.window === "TOO_EARLY")) return "UPCOMING";
  if (entries.every((entry) => entry.window === "CANCELLED")) {
    return "CANCELLED";
  }
  return "FINISHED";
}

const PHASE_ORDER: Record<OccasionPhase, number> = {
  NOW: 0,
  UPCOMING: 1,
  FINISHED: 2,
  CANCELLED: 3,
};

/** Who still has to come in (entry open) first, then the rest. */
function entryRank(entry: GateEntry): number {
  if (!entry.checkedInAt && entry.window === "OPEN") return 0;
  if (!entry.checkedInAt && entry.window === "TOO_EARLY") return 1;
  if (entry.checkedInAt) return 2;
  return 3;
}

const byEntry = (a: GateEntry, b: GateEntry) =>
  entryRank(a) - entryRank(b) || a.name.localeCompare(b.name, "pt-BR");

function occasion(
  base: Omit<GateOccasion, "phase" | "opensAt" | "total" | "inside">,
): GateOccasion {
  const entries = [...base.entries].sort(byEntry);
  return {
    ...base,
    entries,
    phase: phaseOf(entries),
    opensAt: opensAt(base.startsAt),
    total: entries.length,
    inside: entries.filter((entry) => entry.checkedInAt).length,
  };
}

/** The day's occasions, in the order the gate works through them. */
export function buildAgenda(
  guests: GateGuest[],
  tickets: GateEventTicket[],
): GateOccasion[] {
  const bookings = new Map<string, GateGuest[]>();
  for (const guest of guests) {
    bookings.set(guest.bookingId, [
      ...(bookings.get(guest.bookingId) ?? []),
      guest,
    ]);
  }
  const events = new Map<string, GateEventTicket[]>();
  for (const ticket of tickets) {
    events.set(ticket.eventId, [...(events.get(ticket.eventId) ?? []), ticket]);
  }

  const occasions: GateOccasion[] = [];
  for (const [bookingId, list] of bookings) {
    const first = list[0];
    occasions.push(
      occasion({
        key: `booking:${bookingId}`,
        kind: "booking",
        title: first.spaceName,
        subtitle: `Convidados de ${first.hostName}${first.unitLabel ? ` · ${first.unitLabel}` : ""}`,
        slot: formatSlot(first.startsAt, first.endsAt),
        startsAt: first.startsAt,
        entries: list.map(guestEntry),
      }),
    );
  }
  for (const [eventId, list] of events) {
    const first = list[0];
    occasions.push(
      occasion({
        key: `event:${eventId}`,
        kind: "event",
        title: first.eventTitle,
        subtitle: first.placeName,
        slot: formatSlot(first.startsAt, first.endsAt),
        startsAt: first.startsAt,
        entries: list.map(ticketEntry),
      }),
    );
  }
  return occasions.sort(
    (a, b) =>
      PHASE_ORDER[a.phase] - PHASE_ORDER[b.phase] ||
      a.startsAt.localeCompare(b.startsAt) ||
      a.title.localeCompare(b.title, "pt-BR"),
  );
}

export const hasFilters = (filters: GateFilters) =>
  filters.search.trim() !== "" ||
  filters.kind !== "all" ||
  filters.status !== "all" ||
  filters.occasion !== "";

/**
 * The agenda narrowed by the filters: occasions keep only the people that
 * match, and the ones left with nobody drop out. (The gate works with the
 * day's whole list, refreshed every minute, so it filters on the spot.)
 */
export function filterAgenda(
  agenda: GateOccasion[],
  filters: GateFilters,
): GateOccasion[] {
  const term = normalize(filters.search);
  return agenda
    .filter(
      (item) =>
        (filters.kind === "all" || item.kind === filters.kind) &&
        (!filters.occasion || item.key === filters.occasion),
    )
    .map((item) => ({
      ...item,
      entries: item.entries.filter(
        (entry) =>
          (!term || entry.haystack.includes(term)) &&
          (filters.status === "all" ||
            (filters.status === "inside"
              ? Boolean(entry.checkedInAt)
              : !entry.checkedInAt && entry.window === "OPEN")),
      ),
    }))
    .filter((item) => item.entries.length > 0);
}

/** "Entrada liberada", "Entrada a partir das 16:00"… */
export function phaseLabel(item: GateOccasion): string {
  switch (item.phase) {
    case "NOW":
      return "Entrada liberada";
    case "UPCOMING":
      return `Entrada a partir das ${formatTime(item.opensAt)}`;
    case "CANCELLED":
      return item.kind === "event" ? "Evento cancelado" : "Reserva cancelada";
    default:
      return "Encerrado";
  }
}
