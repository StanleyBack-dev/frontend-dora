import "server-only";
import { backendGraphql } from "@/server/graphql/client";
import {
  approveEventOrderDocument,
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
  EventOrderStatus,
  EventWhen,
} from "@/shared/contracts/events";

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

  async orders(
    token: string,
    eventId: string,
    status: EventOrderStatus | null,
  ): Promise<EventOrder[]> {
    const { eventOrders } = await backendGraphql(eventOrdersDocument, {
      token,
      variables: { eventId, status },
    });
    return eventOrders;
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
};
