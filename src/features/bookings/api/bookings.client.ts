import { apiRequest } from "@/shared/lib/api-client";
import type {
  Booking,
  SpaceAvailability,
  SpaceBlockInput,
} from "@/shared/contracts/bookings";

export const bookingsClient = {
  availability: (spaceId: string, date: string) =>
    apiRequest<SpaceAvailability>(
      `/spaces/${spaceId}/availability?date=${encodeURIComponent(date)}`,
    ),

  create: (input: {
    spaceId: string;
    startsAt: string;
    notes: string | null;
  }) =>
    apiRequest<Booking>("/bookings", {
      method: "POST",
      body: JSON.stringify(input),
    }),

  cancel: (id: string, reason: string | null = null) =>
    apiRequest<Booking>(`/bookings/${id}/cancel`, {
      method: "POST",
      body: JSON.stringify({ reason }),
    }),

  approve: (id: string) =>
    apiRequest<Booking>(`/bookings/${id}/approve`, { method: "POST" }),

  reject: (id: string, reason: string) =>
    apiRequest<Booking>(`/bookings/${id}/reject`, {
      method: "POST",
      body: JSON.stringify({ reason }),
    }),

  createBlock: (spaceId: string, input: SpaceBlockInput) =>
    apiRequest<{ ok: true }>(`/spaces/${spaceId}/blocks`, {
      method: "POST",
      body: JSON.stringify(input),
    }),

  deleteBlock: (id: string) =>
    apiRequest<{ ok: true }>(`/space-blocks/${id}`, { method: "DELETE" }),
};
