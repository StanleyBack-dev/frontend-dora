import "server-only";
import { authed } from "@/server/auth/current-user";
import { bookingsService } from "@/server/services/bookings.service";
import { eventsService } from "@/server/services/events.service";
import type { GateGuest } from "@/shared/contracts/bookings";
import type { CurrentCondominium } from "@/shared/contracts/api";
import type { GateEventTicket } from "@/shared/contracts/events";

/** What the gate works with today: guests, tickets, and which it has. */
export type GateDay = {
  guests: GateGuest[];
  tickets: GateEventTicket[];
  /** The condominium has the events module (the tickets list shows). */
  events: boolean;
};

// The gate's day (Portaria and its full screen): the booking guests (an
// empty list without the bookings module) and, with the events module, the
// event tickets.
export async function loadGateDay(
  condominium: CurrentCondominium,
): Promise<GateDay> {
  const events = condominium.modules.includes("EVENTS");
  const [guests, tickets] = await Promise.all([
    authed((token) => bookingsService.gateGuests(token)),
    events
      ? authed((token) => eventsService.gateTickets(token)).catch(() => [])
      : Promise.resolve([]),
  ]);
  return { guests, tickets, events };
}
