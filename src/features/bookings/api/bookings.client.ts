import { apiRequest } from "@/shared/lib/api-client";
import type {
  Booking,
  BookingGuest,
  BookingSeriesResult,
  GateGuest,
  GuestInput,
  SeriesCancellation,
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

  // --- weekly series ---
  createSeries: (input: {
    spaceId: string;
    startsAt: string;
    weeks: number;
    notes: string | null;
  }) =>
    apiRequest<BookingSeriesResult>("/bookings/series", {
      method: "POST",
      body: JSON.stringify(input),
    }),

  cancelSeries: (seriesId: string) =>
    apiRequest<SeriesCancellation>(`/bookings/series/${seriesId}/cancel`, {
      method: "POST",
    }),

  // --- waiting list ---
  joinWaitlist: (spaceId: string, startsAt: string) =>
    apiRequest<{ ok: true }>("/waitlist", {
      method: "POST",
      body: JSON.stringify({ spaceId, startsAt }),
    }),

  leaveWaitlist: (spaceId: string, startsAt: string) =>
    apiRequest<{ ok: true }>("/waitlist", {
      method: "DELETE",
      body: JSON.stringify({ spaceId, startsAt }),
    }),

  // --- guests ---
  guests: (bookingId: string) =>
    apiRequest<BookingGuest[]>(`/bookings/${bookingId}/guests`),

  addGuests: (bookingId: string, guests: GuestInput[]) =>
    apiRequest<BookingGuest[]>(`/bookings/${bookingId}/guests`, {
      method: "POST",
      body: JSON.stringify({ guests }),
    }),

  removeGuest: (id: string) =>
    apiRequest<{ ok: true }>(`/guests/${id}`, { method: "DELETE" }),

  // --- the gate (Portaria) ---
  gateGuests: (date?: string) =>
    apiRequest<GateGuest[]>(
      date ? `/gate?date=${encodeURIComponent(date)}` : "/gate",
    ),

  checkIn: (target: { guestId?: string; code?: string }) =>
    apiRequest<GateGuest>("/gate/check-in", {
      method: "POST",
      body: JSON.stringify(target),
    }),

  undoCheckIn: (guestId: string) =>
    apiRequest<GateGuest>(`/gate/${guestId}/undo`, { method: "POST" }),

  // --- usage fees ---
  setFeesBilled: (bookingIds: string[], billed: boolean) =>
    apiRequest<{ changed: number }>("/bookings/fees/billed", {
      method: "POST",
      body: JSON.stringify({ bookingIds, billed }),
    }),
};
