"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cn, LinkPendingSwap } from "@/design-system";
import { BookingCalendarItem } from "@/features/bookings/components/BookingCalendarItem";
import {
  bookingsByDay,
  formatDayFull,
  formatWeekday,
} from "@/features/bookings/model/booking-calendar";
import type { Booking } from "@/shared/contracts/bookings";

const SHOWN = 3;

// A month of bookings: its weeks as rows, Sunday to Saturday. Each week opens
// in the week view (the "Semana" button at its side, or a day's number); a
// day lists its first bookings, and "+ N mais" selects it. On phones a day is
// a square with its number and how many bookings it has, and tapping it
// selects it. The selected day's bookings are listed below the grid, and each
// one opens its panel.
export function BookingsMonthView({
  weeks,
  month,
  bookings,
  today,
  weekHref,
  onOpen,
}: {
  weeks: string[][];
  /** "YYYY-MM": days outside it are dimmed. */
  month: string;
  bookings: Booking[];
  today: string;
  /** The week view of a day, by the day ("YYYY-MM-DD"). */
  weekHref: Record<string, string>;
  onOpen: (booking: Booking) => void;
}) {
  const byDay = bookingsByDay(bookings);
  const [selected, setSelected] = useState<string | null>(
    today.slice(0, 7) === month ? today : null,
  );
  const selectedItems = selected ? (byDay[selected] ?? []) : [];

  return (
    <div>
      <div className="grid grid-cols-7 border-b border-border md:grid-cols-[72px_repeat(7,minmax(0,1fr))]">
        <span className="hidden md:block" />
        {weeks[0].map((day) => (
          <span
            key={day}
            className="py-2 text-center text-[11px] font-semibold text-soft uppercase"
          >
            {formatWeekday(day)}
          </span>
        ))}
      </div>
      {weeks.map((week) => (
        <div
          key={week[0]}
          className="grid grid-cols-7 border-b border-border md:grid-cols-[72px_repeat(7,minmax(0,1fr))]"
        >
          <Link
            href={weekHref[week[0]]}
            className="group hidden flex-col items-center justify-center gap-1 text-[11px] font-semibold text-brand-ink transition-colors hover:bg-brand-soft md:flex"
          >
            Semana
            <LinkPendingSwap>
              <ChevronRight
                aria-hidden
                className="size-4 transition-transform group-hover:translate-x-0.5"
              />
            </LinkPendingSwap>
          </Link>
          {week.map((day) => {
            const items = byDay[day] ?? [];
            const outside = day.slice(0, 7) !== month;
            const current = day === today;
            const active = day === selected;
            return (
              <div
                key={day}
                className={cn(
                  "min-w-0 border-l border-border max-md:nth-[2]:border-l-0",
                  outside && "bg-surface-muted/50",
                )}
              >
                {/* Larger screens: the day's bookings. */}
                <div className="hidden min-h-28 flex-col gap-1 p-1.5 md:flex">
                  <Link
                    href={weekHref[day]}
                    aria-label={`Ver a semana de ${Number(day.slice(8))}`}
                    className={cn(
                      "grid size-6 place-items-center self-end rounded-full text-xs font-bold transition-colors hover:bg-brand-soft",
                      current
                        ? "bg-brand text-brand-fg hover:bg-brand"
                        : outside
                          ? "text-soft"
                          : "text-fg",
                    )}
                  >
                    <LinkPendingSwap>{Number(day.slice(8))}</LinkPendingSwap>
                  </Link>
                  {items.slice(0, SHOWN).map((booking) => (
                    <BookingCalendarItem
                      key={booking.id}
                      booking={booking}
                      onOpen={onOpen}
                      variant="chip"
                    />
                  ))}
                  {items.length > SHOWN && (
                    <button
                      type="button"
                      onClick={() => setSelected(day)}
                      className="px-1.5 text-left text-[11px] font-semibold text-brand-ink hover:underline"
                    >
                      + {items.length - SHOWN} mais
                    </button>
                  )}
                </div>

                {/* Phones: the day as a square that selects it. */}
                <button
                  type="button"
                  onClick={() => setSelected(day)}
                  aria-pressed={active}
                  aria-label={`${formatDayFull(day)}: ${items.length} ${items.length === 1 ? "reserva" : "reservas"}`}
                  className={cn(
                    "flex aspect-square w-full flex-col items-center justify-center gap-1 transition-colors hover:bg-brand-soft md:hidden",
                    active && "bg-brand-soft",
                  )}
                >
                  <span
                    className={cn(
                      "grid size-7 place-items-center rounded-full text-[13px] font-bold",
                      current
                        ? "bg-brand text-brand-fg"
                        : outside
                          ? "text-soft"
                          : "text-fg",
                    )}
                  >
                    {Number(day.slice(8))}
                  </span>
                  {items.length > 0 && (
                    <span className="rounded-full bg-brand-soft px-1.5 text-[10px] leading-4 font-bold text-brand-ink">
                      {items.length}
                    </span>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      ))}

      {/* The selected day's bookings: always on phones, on larger screens
          only when "+ N mais" asked for them. */}
      {selected && weekHref[selected] && (
        <section
          className={cn(
            "flex flex-col gap-2 p-3",
            selectedItems.length <= SHOWN && "md:hidden",
          )}
        >
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-sm font-semibold text-fg first-letter:uppercase">
              {formatDayFull(selected)}
            </h3>
            <Link
              href={weekHref[selected]}
              className="flex shrink-0 items-center gap-0.5 text-xs font-semibold text-brand-ink hover:underline"
            >
              Ver semana
              <LinkPendingSwap>
                <ChevronRight aria-hidden className="size-4" />
              </LinkPendingSwap>
            </Link>
          </div>
          {selectedItems.length === 0 ? (
            <p className="text-sm text-soft">Nenhuma reserva neste dia.</p>
          ) : (
            <div className="grid gap-2 md:grid-cols-3">
              {selectedItems.map((booking) => (
                <BookingCalendarItem
                  key={booking.id}
                  booking={booking}
                  onOpen={onOpen}
                />
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
