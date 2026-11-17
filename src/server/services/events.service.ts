import "server-only";
import { backendGraphql } from "@/server/graphql/client";
import type { Paginated } from "@/shared/contracts/api";
import {
  approveEventOrderDocument,
  eventOrdersQueueDocument,
  eventTicketsDocument,
  eventTicketOverviewDocument,
  eventOrderOverviewDocument,
  checkInEventTicketDocument,
  eventTicketPassDocument,
  gateEventTicketsDocument,
  undoEventTicketCheckInDocument,
  cancelEventOrderDocument,
  createEventOrderDocument,
  eventOrdersDocument,
  myEventOrdersDocument,
  rejectEventOrderDocument,
  submitEventOrderReceiptDocument,
  submitEventAttendeeProofDocument,
  cancelEventDocument,
  createEventDocument,
  eventDocument,
  eventsDocument,
  publishEventDocument,
  updateEventDocument,
} from "@/server/graphql/operations/events.operations";
import type {
  AttendeeInput,
  CondominiumEvent,
  EventInput,
  EventOrder,
  EventOrderFilter,
  EventOrderOverview,
  EventOrderStatus,
  EventTicketFilter,
  EventTicketOverview,
  EventTicketPass,
  EventWhen,
  GateEventTicket,
} from "@/shared/contracts/events";

/** Which page of a list, and how many per page. */
type PageRequest = { page: number; limit: number };

export const eventsService = {
  /** Upcoming or past; managers also get the drafts. */
  async list(token: string, when: EventWhen): Promise<CondominiumEvent[]> {
    const { events } = await backendGraphql(eventsDocument, {
      token,
      variables: { when },
    });
    return events;
  },

  async get(token: string, id: string): Promise<CondominiumEvent> {
    const { event } = await backendGraphql(eventDocument, {
      token,
      variables: { id },
    });
    return event;
  },

  async create(token: string, input: EventInput): Promise<CondominiumEvent> {
    const { createEvent } = await backendGraphql(createEventDocument, {
      token,
      variables: { input },
    });
    return createEvent;
  },

  async update(
    token: string,
    id: string,
    input: EventInput,
  ): Promise<CondominiumEvent> {
    const { updateEvent } = await backendGraphql(updateEventDocument, {
      token,
      variables: { id, input },
    });
    return updateEvent;
  },

  async publish(token: string, id: string): Promise<CondominiumEvent> {
    const { publishEvent } = await backendGraphql(publishEventDocument, {
      token,
      variables: { id },
    });
    return publishEvent;
  },

  async cancel(
    token: string,
    id: string,
    reason: string,
  ): Promise<CondominiumEvent> {
    const { cancelEvent } = await backendGraphql(cancelEventDocument, {
      token,
      variables: { id, reason },
    });
    return cancelEvent;
  },

  async myOrders(token: string, eventId: string): Promise<EventOrder[]> {
    const { myEventOrders } = await backendGraphql(myEventOrdersDocument, {
      token,
      variables: { eventId },
    });
    return myEventOrders;
  },

  /** A page of an event's orders that match the filter. */
  async orders(
    token: string,
    eventId: string,
    filter: EventOrderFilter,
    page: PageRequest,
  ): Promise<Paginated<EventOrder>> {
    const { eventOrders } = await backendGraphql(eventOrdersDocument, {
      token,
      variables: { eventId, filter, page },
    });
    return eventOrders;
  },

  /** An event's orders at a glance: the numbers and the filter options. */
  async orderOverview(
    token: string,
    eventId: string,
  ): Promise<EventOrderOverview> {
    const { eventOrderOverview } = await backendGraphql(
      eventOrderOverviewDocument,
      { token, variables: { eventId } },
    );
    return eventOrderOverview;
  },

  async createOrder(
    token: string,
    eventId: string,
    attendees: AttendeeInput[],
  ): Promise<EventOrder> {
    const { createEventOrder } = await backendGraphql(
      createEventOrderDocument,
      { token, variables: { eventId, attendees } },
    );
    return createEventOrder;
  },

  async submitReceipt(
    token: string,
    id: string,
    file: string,
  ): Promise<EventOrder> {
    const { submitEventOrderReceipt } = await backendGraphql(
      submitEventOrderReceiptDocument,
      { token, variables: { id, file } },
    );
    return submitEventOrderReceipt;
  },

  async cancelOrder(token: string, id: string): Promise<EventOrder> {
    const { cancelEventOrder } = await backendGraphql(
      cancelEventOrderDocument,
      { token, variables: { id } },
    );
    return cancelEventOrder;
  },

  async approveOrder(token: string, id: string): Promise<EventOrder> {
    const { approveEventOrder } = await backendGraphql(
      approveEventOrderDocument,
      { token, variables: { id } },
    );
    return approveEventOrder;
  },

  async rejectOrder(
    token: string,
    id: string,
    reason: string,
  ): Promise<EventOrder> {
    const { rejectEventOrder } = await backendGraphql(
      rejectEventOrderDocument,
      { token, variables: { id, reason } },
    );
    return rejectEventOrder;
  },

  async submitProof(
    token: string,
    orderId: string,
    attendeeId: string,
    file: string,
  ): Promise<EventOrder> {
    const { submitEventAttendeeProof } = await backendGraphql(
      submitEventAttendeeProofDocument,
      { token, variables: { orderId, attendeeId, file } },
    );
    return submitEventAttendeeProof;
  },

  // === the gate (Portaria) and the ticket page ===

  async gateTickets(token: string, date?: string): Promise<GateEventTicket[]> {
    const { gateEventTickets } = await backendGraphql(
      gateEventTicketsDocument,
      { token, variables: { date: date ?? null } },
    );
    return gateEventTickets;
  },

  async checkInTicket(
    token: string,
    target: { attendeeId?: string | null; code?: string | null },
  ): Promise<GateEventTicket> {
    const { checkInEventTicket } = await backendGraphql(
      checkInEventTicketDocument,
      { token, variables: { input: target } },
    );
    return checkInEventTicket;
  },

  async undoTicketCheckIn(
    token: string,
    attendeeId: string,
  ): Promise<GateEventTicket> {
    const { undoEventTicketCheckIn } = await backendGraphql(
      undoEventTicketCheckInDocument,
      { token, variables: { attendeeId } },
    );
    return undoEventTicketCheckIn;
  },

  /** Public: the ticket page (null: no such code, or not confirmed). */
  async ticketPass(code: string): Promise<EventTicketPass | null> {
    const { eventTicket } = await backendGraphql(eventTicketPassDocument, {
      variables: { code },
    });
    return eventTicket ?? null;
  },

  // === the events module in the management ===

  /** The orders of every event (or one), oldest first: the review queue. */
  async ordersQueue(
    token: string,
    eventId: string | null,
    status: EventOrderStatus | null = null,
  ): Promise<EventOrder[]> {
    const { eventOrdersQueue } = await backendGraphql(
      eventOrdersQueueDocument,
      { token, variables: { status, eventId } },
    );
    return eventOrdersQueue;
  },

  /** An event's tickets (confirmed orders) and who came in. */
  /** A page of an event's tickets that match the filter. */
  async tickets(
    token: string,
    eventId: string,
    filter: EventTicketFilter,
    page: PageRequest,
  ): Promise<Paginated<GateEventTicket>> {
    const { eventTickets } = await backendGraphql(eventTicketsDocument, {
      token,
      variables: { eventId, filter, page },
    });
    return eventTickets;
  },

  /** An event's tickets at a glance: the numbers and the filter options. */
  async ticketOverview(
    token: string,
    eventId: string,
  ): Promise<EventTicketOverview> {
    const { eventTicketOverview } = await backendGraphql(
      eventTicketOverviewDocument,
      { token, variables: { eventId } },
    );
    return eventTicketOverview;
  },
};
