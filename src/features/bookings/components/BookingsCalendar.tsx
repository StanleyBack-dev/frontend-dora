"use client";

import { useState } from "react";
import { Drawer } from "@/design-system";
import { BookingDetails } from "@/features/bookings/components/BookingDetails";
import {
  BookingManageActions,
  hasManageActions,
} from "@/features/bookings/components/BookingManageActions";
import { BookingStatusLegend } from "@/features/bookings/components/BookingStatusLegend";
import { BookingsMonthView } from "@/features/bookings/components/BookingsMonthView";
import { BookingsWeekView } from "@/features/bookings/components/BookingsWeekView";
import { formatBookingPeriod } from "@/features/bookings/model/booking-labels";
import type { Booking } from "@/shared/contracts/bookings";

type WeekProps = { view: "semana"; days: string[]; hours: number[] };
type MonthProps = {
  view: "mes";
  weeks: string[][];
  month: string;
  weekHref: Record<string, string>;
};

// The manager's calendar of bookings (a week or a month). A booking opens a
// side panel with everything about it, one line each, and its buttons.
export function BookingsCalendar({
  bookings,
  today,
  now,
  showSpace,
  ...view
}: (WeekProps | MonthProps) & {
  bookings: Booking[];
  today: string;
  now: number;
  /** False when a single space is filtered. */
  showSpace: boolean;
}) {
  // By id, so the panel shows the fresh booking after a decision.
  const [openId, setOpenId] = useState<string | null>(null);
  const open = bookings.find((booking) => booking.id === openId) ?? null;
  const onOpen = (booking: Booking) => setOpenId(booking.id);

  return (
    <>
      <BookingStatusLegend className="border-b border-border px-3 py-2.5 sm:px-4" />
      {view.view === "semana" ? (
        <BookingsWeekView
          days={view.days}
          hours={view.hours}
          bookings={bookings}
          today={today}
          showSpace={showSpace}
          onOpen={onOpen}
        />
      ) : (
        <BookingsMonthView
          // A new month starts over (its selected day belongs to the old one).
          key={view.month}
          weeks={view.weeks}
          month={view.month}
          bookings={bookings}
          today={today}
          weekHref={view.weekHref}
          onOpen={onOpen}
        />
      )}
      <Drawer
        open={open !== null}
        onClose={() => setOpenId(null)}
        title={open?.spaceName ?? ""}
        subtitle={open ? formatBookingPeriod(open) : undefined}
        width="sm"
        footer={
          open &&
          hasManageActions(open, now) && (
            <BookingManageActions booking={open} now={now} />
          )
        }
      >
        {open && <BookingDetails booking={open} />}
      </Drawer>
    </>
  );
}
