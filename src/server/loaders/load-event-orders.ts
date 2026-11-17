import "server-only";
import { authed } from "@/server/auth/current-user";
import { eventsService } from "@/server/services/events.service";
import type { EventOrder, EventOrderFilter } from "@/shared/contracts/events";

/** The caller's own orders for an event (newest first). */
export function loadMyEventOrders(eventId: string): Promise<EventOrder[]> {
  return authed((token) => eventsService.myOrders(token, eventId));
}

/** An event's orders that match the filter, for whoever reviews payments. */
export function loadEventOrders(
  eventId: string,
  filter: EventOrderFilter = {},
): Promise<EventOrder[]> {
  return authed((token) => eventsService.orders(token, eventId, filter));
}
