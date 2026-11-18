import { cn } from "@/design-system";
import { STATUS_STYLES } from "@/features/bookings/model/booking-calendar";
import { BOOKING_STATUS } from "@/features/bookings/model/booking-labels";
import type { Booking } from "@/shared/contracts/bookings";
import { formatTime } from "@/shared/lib/datetime";

// A booking inside the calendar, as a button that opens its panel: painted
// in the colour of its status, with the time, who booked (highlighted) and
// the space. "card" fills a cell of the week; "chip" is one line of a month day.
export function BookingCalendarItem({
  booking,
  onOpen,
  variant = "card",
  showSpace = true,
}: {
  booking: Booking;
  onOpen: (booking: Booking) => void;
  variant?: "card" | "chip";
  /** Hidden when a single space is filtered (it says nothing then). */
  showSpace?: boolean;
}) {
  const status = BOOKING_STATUS[booking.status];
  const crossed =
    booking.status === "CANCELLED" || booking.status === "REJECTED";
  const label = `${booking.userName}, ${booking.spaceName}, ${formatTime(booking.startsAt)} às ${formatTime(booking.endsAt)}, ${status.label}`;

  if (variant === "chip") {
    return (
      <button
        type="button"
        onClick={() => onOpen(booking)}
        aria-label={label}
        className={cn(
          "flex w-full items-center gap-1.5 truncate rounded-md border px-1.5 py-0.5 text-left text-[11px] transition hover:brightness-95 focus-visible:ring-2 focus-visible:ring-fg focus-visible:outline-none",
          STATUS_STYLES[booking.status],
        )}
      >
        <span className="font-semibold tabular-nums">
          {formatTime(booking.startsAt)}
        </span>
        <span className={cn("truncate opacity-85", crossed && "line-through")}>
          {booking.userName}
        </span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => onOpen(booking)}
      aria-label={label}
      className={cn(
        "flex w-full flex-col gap-0.5 rounded-lg border px-2 py-1.5 text-left shadow-sm transition hover:-translate-y-px hover:shadow-md focus-visible:ring-2 focus-visible:ring-fg focus-visible:ring-offset-1 focus-visible:outline-none",
        STATUS_STYLES[booking.status],
      )}
    >
      <span className="flex items-center justify-between gap-1 text-[11px] opacity-85 tabular-nums">
        {formatTime(booking.startsAt)}–{formatTime(booking.endsAt)}
        <span className="truncate text-[10px] font-semibold tracking-wide uppercase">
          {status.short}
        </span>
      </span>
      <span
        className={cn(
          "truncate text-[13px] font-semibold",
          crossed && "line-through",
        )}
      >
        {booking.userName}
      </span>
      {showSpace && (
        <span className="truncate text-[11px] opacity-75">
          {booking.spaceName}
        </span>
      )}
    </button>
  );
}
