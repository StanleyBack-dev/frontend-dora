import { apiRequest } from "@/shared/lib/api-client";
import type { CondominiumEvent, EventInput } from "@/shared/contracts/events";

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
};
