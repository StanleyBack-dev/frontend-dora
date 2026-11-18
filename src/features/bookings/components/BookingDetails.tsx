import { Repeat } from "lucide-react";
import { Badge } from "@/design-system";
import {
  BOOKING_STATUS,
  formatBookingPeriod,
} from "@/features/bookings/model/booking-labels";
import type { Booking } from "@/shared/contracts/bookings";
import { formatDateTime } from "@/shared/lib/datetime";
import { formatCents } from "@/shared/lib/format";

export type BookingDetailField = {
  key: string;
  label: string;
  render: (booking: Booking) => React.ReactNode;
};

const empty = <span className="text-soft">—</span>;

/**
 * What a manager reads about a booking beyond its row, one line each: the
 * list's expanded row and the calendar's panel share it.
 */
export const BOOKING_DETAIL_FIELDS: BookingDetailField[] = [
  {
    key: "unit",
    label: "Unidade",
    render: (booking) => booking.unitLabel ?? empty,
  },
  {
    key: "fee",
    label: "Taxa de uso",
    render: (booking) =>
      booking.feeCents === null
        ? "Sem taxa"
        : `${formatCents(booking.feeCents)}${booking.feeBilledAt ? " · lançada na cobrança" : ""}`,
  },
  {
    key: "series",
    label: "Tipo",
    render: (booking) =>
      booking.seriesId ? (
        <span className="inline-flex items-center gap-1">
          <Repeat aria-hidden className="size-3.5 text-soft" />
          Semanal
        </span>
      ) : (
        "Data única"
      ),
  },
  {
    key: "notes",
    label: "Observação",
    render: (booking) => booking.notes ?? empty,
  },
  {
    key: "reason",
    label: "Motivo",
    render: (booking) => {
      if (!booking.reason) return empty;
      if (booking.status === "REJECTED") return `Recusa: ${booking.reason}`;
      return booking.cancelledByManager
        ? `Cancelada pela administração: ${booking.reason}`
        : booking.reason;
    },
  },
  {
    key: "cancelUntil",
    label: "Cancelável até",
    render: (booking) => formatDateTime(booking.cancelUntil),
  },
  {
    key: "createdAt",
    label: "Pedida em",
    render: (booking) => formatDateTime(booking.createdAt),
  },
];

// The whole booking as label/value lines (the calendar's side panel): who,
// where, when and its status first, then the details above.
export function BookingDetails({ booking }: { booking: Booking }) {
  const fields: BookingDetailField[] = [
    { key: "who", label: "Morador", render: (item) => item.userName },
    { key: "space", label: "Espaço", render: (item) => item.spaceName },
    {
      key: "when",
      label: "Quando",
      render: (item) => (
        <span className="capitalize">{formatBookingPeriod(item)}</span>
      ),
    },
    {
      key: "status",
      label: "Situação",
      render: (item) => (
        <Badge tone={BOOKING_STATUS[item.status].tone}>
          {BOOKING_STATUS[item.status].label}
        </Badge>
      ),
    },
    ...BOOKING_DETAIL_FIELDS,
  ];
  return (
    <dl className="divide-y divide-border">
      {fields.map((field) => (
        <div
          key={field.key}
          className="flex flex-col gap-0.5 py-2.5 sm:flex-row sm:items-baseline sm:gap-4"
        >
          <dt className="text-[10px] font-medium tracking-wide text-soft uppercase sm:w-32 sm:shrink-0">
            {field.label}
          </dt>
          <dd className="min-w-0 flex-1 text-[13px] break-words text-fg">
            {field.render(booking)}
          </dd>
        </div>
      ))}
    </dl>
  );
}
