import "server-only";
import { authed } from "@/server/auth/current-user";
import { eventsService } from "@/server/services/events.service";
import type { Paginated } from "@/shared/contracts/api";
import type {
  EventOrder,
  EventOrderFilter,
  EventOrderOverview,
} from "@/shared/contracts/events";

/** The caller's own orders for an event (newest first). */
export function loadMyEventOrders(eventId: string): Promise<EventOrder[]> {
  return authed((token) => eventsService.myOrders(token, eventId));
}

/** A page of an event's orders that match the filter (payments review). */
export function loadEventOrders(
  eventId: string,
  filter: EventOrderFilter,
  page: { page: number; limit: number },
): Promise<Paginated<EventOrder>> {
  return authed((token) => eventsService.orders(token, eventId, filter, page));
}

/** An event's orders at a glance: the numbers and the filter options. */
export function loadEventOrderOverview(
  eventId: string,
): Promise<EventOrderOverview> {
  return authed((token) => eventsService.orderOverview(token, eventId));
}
