import { apiRequest } from "@/shared/lib/api-client";
import type {
  AttendeeInput,
  CondominiumEvent,
  EventInput,
  EventOrder,
  PixReceiver,
} from "@/shared/contracts/events";

export const eventsClient = {
  create: (input: EventInput) =>
    apiRequest<CondominiumEvent>("/events", {
      method: "POST",
      body: JSON.stringify(input),
    }),

  update: (id: string, input: EventInput) =>
    apiRequest<CondominiumEvent>(`/events/${id}`, {
      method: "PATCH",
      body: JSON.stringify(input),
    }),

  publish: (id: string) =>
    apiRequest<CondominiumEvent>(`/events/${id}/publish`, { method: "POST" }),

  cancel: (id: string, reason: string) =>
    apiRequest<CondominiumEvent>(`/events/${id}/cancel`, {
      method: "POST",
      body: JSON.stringify({ reason }),
    }),

  createOrder: (eventId: string, attendees: AttendeeInput[]) =>
    apiRequest<EventOrder>(`/events/${eventId}/orders`, {
      method: "POST",
      body: JSON.stringify({ attendees }),
    }),

  submitReceipt: (orderId: string, file: string) =>
    apiRequest<EventOrder>(`/event-orders/${orderId}/receipt`, {
      method: "POST",
      body: JSON.stringify({ file }),
    }),

  cancelOrder: (orderId: string) =>
    apiRequest<EventOrder>(`/event-orders/${orderId}/cancel`, {
      method: "POST",
    }),

  approveOrder: (orderId: string) =>
    apiRequest<EventOrder>(`/event-orders/${orderId}/approve`, {
      method: "POST",
    }),

  rejectOrder: (orderId: string, reason: string) =>
    apiRequest<EventOrder>(`/event-orders/${orderId}/reject`, {
      method: "POST",
      body: JSON.stringify({ reason }),
    }),

  setCondominiumPix: (input: PixReceiver) =>
    apiRequest<PixReceiver>("/condominium/pix", {
      method: "PUT",
      body: JSON.stringify(input),
    }),

  removeCondominiumPix: () =>
    apiRequest<{ ok: true }>("/condominium/pix", { method: "DELETE" }),

  submitProof: (orderId: string, attendeeId: string, file: string) =>
    apiRequest<EventOrder>(
      `/event-orders/${orderId}/attendees/${attendeeId}/proof`,
      { method: "POST", body: JSON.stringify({ file }) },
    ),
};
