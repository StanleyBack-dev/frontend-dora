import { cn } from "@/design-system";
import { STATUS_STYLES } from "@/features/bookings/model/booking-calendar";
import {
  BOOKING_STATUS,
  BOOKING_STATUS_ORDER,
} from "@/features/bookings/model/booking-labels";

// What each colour of the calendar's bookings means: a dot filled with the
// card's colour, and the status.
export function BookingStatusLegend({ className }: { className?: string }) {
  return (
    <ul
      aria-label="Legenda das situações"
      className={cn(
        "flex flex-wrap gap-x-4 gap-y-1.5 text-[11px] text-muted",
        className,
      )}
    >
      {BOOKING_STATUS_ORDER.map((status) => (
        <li key={status} className="flex items-center gap-1.5">
          <span
            aria-hidden
            className={cn(
              "size-3 shrink-0 rounded-full border",
              STATUS_STYLES[status],
            )}
          />
          {BOOKING_STATUS[status].label}
        </li>
      ))}
    </ul>
  );
}
