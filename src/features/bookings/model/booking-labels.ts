import type { Tone } from "@/design-system";
import type { Booking, BookingStatus } from "@/shared/contracts/bookings";
import { formatLongDay, formatTime } from "@/shared/lib/datetime";

export const BOOKING_STATUS: Record<
  BookingStatus,
  { label: string; tone: Tone }
> = {
  PENDING: { label: "Aguardando aprovação", tone: "warning" },
  CONFIRMED: { label: "Confirmada", tone: "success" },
  REJECTED: { label: "Recusada", tone: "danger" },
  CANCELLED: { label: "Cancelada", tone: "neutral" },
};

export const BOOKING_STATUS_ORDER = Object.keys(
  BOOKING_STATUS,
) as BookingStatus[];

/** "19:00 às 20:00" ("24:00" reads as midnight). */
export const formatSlot = (startsAt: string, endsAt: string) =>
  `${formatTime(startsAt)} às ${formatTime(endsAt)}`;

/** "sábado, 15 de novembro · 19:00 às 20:00". */
export const formatBookingPeriod = (
  booking: Pick<Booking, "startsAt" | "endsAt">,
) =>
  `${formatLongDay(booking.startsAt)} · ${formatSlot(booking.startsAt, booking.endsAt)}`;

/** Whether the booker can still cancel it (the API checks again). */
export const canCancelOwn = (
  booking: Pick<Booking, "status" | "cancelUntil" | "endsAt">,
  now: number,
) =>
  (booking.status === "PENDING" || booking.status === "CONFIRMED") &&
  new Date(booking.endsAt).getTime() > now &&
  new Date(booking.cancelUntil).getTime() >= now;

/** YYYY-MM-DD dates from `first` to `last`, inclusive (at most `max`). */
export function datesBetween(first: string, last: string, max = 120): string[] {
  const dates: string[] = [];
  const cursor = new Date(`${first}T12:00:00Z`);
  const end = new Date(`${last}T12:00:00Z`);
  while (cursor <= end && dates.length < max) {
    dates.push(cursor.toISOString().slice(0, 10));
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return dates;
}

/** Noon of a calendar date in the app time zone (safe for day labels). */
export const noonOf = (date: string) => `${date}T12:00:00-03:00`;
