import { CalendarDays } from "lucide-react";
import { cn } from "@/design-system";
import { BookingCalendarItem } from "@/features/bookings/components/BookingCalendarItem";
import {
  bookingsByDay,
  formatHour,
  formatWeekday,
  startHour,
} from "@/features/bookings/model/booking-calendar";
import type { Booking } from "@/shared/contracts/bookings";

// A week of bookings. Larger screens: a sheet with the hours down the side
// and the seven days across, each booking in the cell of its day and start
// hour (several in a cell stack up, like a kanban column). Phones: the days
// one under another, each with its bookings by time.
export function BookingsWeekView({
  days,
  hours,
  bookings,
  today,
  showSpace,
  onOpen,
}: {
  days: string[];
  hours: number[];
  bookings: Booking[];
  today: string;
  showSpace: boolean;
  onOpen: (booking: Booking) => void;
}) {
  const byDay = bookingsByDay(bookings);
  const at = (day: string, hour: number) =>
    (byDay[day] ?? []).filter((booking) => startHour(booking) === hour);

  return (
    <>
      {/* Larger screens: the sheet. */}
      <div className="hidden overflow-x-auto md:block">
        <div className="grid min-w-[880px] grid-cols-[64px_repeat(7,minmax(0,1fr))]">
          <div className="border-b border-border bg-surface" />
          {days.map((day) => (
            <DayHeader
              key={day}
              day={day}
              today={today}
              count={byDay[day]?.length ?? 0}
            />
          ))}
          {hours.map((hour) => (
            <div key={hour} className="contents">
              <div className="border-b border-border px-2 pt-2 text-right text-[11px] font-medium text-soft tabular-nums">
                {formatHour(hour)}
              </div>
              {days.map((day) => (
                <div
                  key={day}
                  className={cn(
                    "min-h-16 space-y-1.5 border-b border-l border-border p-1.5",
                    day === today && "bg-brand-soft/30",
                  )}
                >
                  {at(day, hour).map((booking) => (
                    <BookingCalendarItem
                      key={booking.id}
                      booking={booking}
                      onOpen={onOpen}
                      showSpace={showSpace}
                    />
                  ))}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Phones: the agenda. */}
      <ol className="divide-y divide-border md:hidden">
        {days.map((day) => {
          const items = byDay[day] ?? [];
          return (
            <li key={day} className="flex gap-3 px-3 py-3">
              <DayChip day={day} today={today} />
              <div className="min-w-0 flex-1 space-y-2">
                {items.length === 0 ? (
                  <p className="flex h-full items-center gap-1.5 text-[13px] text-soft">
                    <CalendarDays aria-hidden className="size-4" />
                    Sem reservas
                  </p>
                ) : (
                  items.map((booking) => (
                    <BookingCalendarItem
                      key={booking.id}
                      booking={booking}
                      onOpen={onOpen}
                      showSpace={showSpace}
                    />
                  ))
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </>
  );
}

function DayHeader({
  day,
  today,
  count,
}: {
  day: string;
  today: string;
  count: number;
}) {
  const current = day === today;
  return (
    <div
      className={cn(
        "flex items-center justify-center gap-2 border-b border-l border-border bg-surface px-2 py-2.5",
        current && "bg-brand-soft",
      )}
    >
      <span className="text-[11px] font-semibold text-soft uppercase">
        {formatWeekday(day)}
      </span>
      <span
        className={cn(
          "grid size-7 place-items-center rounded-full text-sm font-bold",
          current ? "bg-brand text-brand-fg" : "text-fg",
        )}
      >
        {Number(day.slice(8))}
      </span>
      {count > 0 && (
        <span className="rounded-full bg-surface-muted px-1.5 text-[10px] font-semibold text-muted">
          {count}
        </span>
      )}
    </div>
  );
}

function DayChip({ day, today }: { day: string; today: string }) {
  const current = day === today;
  return (
    <span
      className={cn(
        "grid w-12 shrink-0 place-items-center self-start rounded-xl py-1.5 text-center",
        current ? "bg-brand text-brand-fg" : "bg-surface-muted text-fg",
      )}
    >
      <span className="text-[10px] font-semibold uppercase">
        {formatWeekday(day)}
      </span>
      <span className="text-lg leading-none font-extrabold">
        {Number(day.slice(8))}
      </span>
    </span>
  );
}
