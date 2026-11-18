"use client";

import { Badge, DataTable, type DataTableColumn } from "@/design-system";
import { BOOKING_DETAIL_FIELDS } from "@/features/bookings/components/BookingDetails";
import {
  BookingManageActions,
  hasManageActions,
} from "@/features/bookings/components/BookingManageActions";
import {
  BOOKING_STATUS,
  formatBookingPeriod,
  formatCompactPeriod,
  formatSlot,
} from "@/features/bookings/model/booking-labels";
import type { Booking } from "@/shared/contracts/bookings";
import { formatShortDay } from "@/shared/lib/datetime";

// The row of a booking shows one thing per cell (date, time, space, who,
// status). On phones the card's title is the date and time, with who booked
// right under it and a short status beside. The rest lives in the row
// revealed by the chevron, one line each, starting with the full date and
// time (the title may be cut on narrow screens).
const COLUMNS: DataTableColumn<Booking>[] = [
  {
    key: "day",
    label: "Data",
    mobile: "title",
    className: "whitespace-nowrap",
    render: (booking) => (
      <span className="font-medium text-fg capitalize">
        {formatShortDay(booking.startsAt)}
      </span>
    ),
    renderMobile: (booking) => (
      <span className="text-sm font-semibold text-fg">
        {formatCompactPeriod(booking)}
      </span>
    ),
  },
  {
    key: "time",
    label: "Horário",
    mobile: "hidden",
    className: "whitespace-nowrap",
    render: (booking) => formatSlot(booking.startsAt, booking.endsAt),
  },
  {
    // Phones only: the card's title can be cut, so the full date and time
    // open first in the details.
    key: "when",
    label: "Quando",
    desktop: "hidden",
    render: (booking) => (
      <span className="block first-letter:uppercase">
        {formatBookingPeriod(booking)}
      </span>
    ),
  },
  {
    key: "space",
    label: "Espaço",
    render: (booking) => booking.spaceName,
  },
  {
    key: "who",
    label: "Morador",
    mobile: "subtitle",
    render: (booking) => booking.userName,
    renderMobile: (booking) => (
      <span className="text-[13px] font-semibold text-brand-ink">
        {booking.userName}
      </span>
    ),
  },
  {
    key: "status",
    label: "Situação",
    mobile: "control",
    className: "whitespace-nowrap",
    render: (booking) => (
      <Badge tone={BOOKING_STATUS[booking.status].tone}>
        {BOOKING_STATUS[booking.status].label}
      </Badge>
    ),
    renderMobile: (booking) => (
      <Badge tone={BOOKING_STATUS[booking.status].tone}>
        {BOOKING_STATUS[booking.status].short}
      </Badge>
    ),
  },
  ...BOOKING_DETAIL_FIELDS.map((field): DataTableColumn<Booking> => ({
    ...field,
    desktop: "detail",
  })),
];

// Every booking of the condominium for managers, as a list: every row starts
// closed, and the chevron reveals its details and buttons.
export function BookingsManageTable({
  bookings,
  now,
}: {
  bookings: Booking[];
  now: number;
}) {
  return (
    <DataTable
      rows={bookings}
      columns={COLUMNS}
      getId={(item) => item.id}
      renderDesktopExpanded={(booking) =>
        hasManageActions(booking, now) && (
          <div className="border-t border-border pt-3">
            <BookingManageActions booking={booking} now={now} />
          </div>
        )
      }
      renderExpanded={(booking) =>
        hasManageActions(booking, now) && (
          <div className="border-t border-border bg-surface-muted/40 p-3">
            <BookingManageActions booking={booking} now={now} layout="grid" />
          </div>
        )
      }
    />
  );
}
