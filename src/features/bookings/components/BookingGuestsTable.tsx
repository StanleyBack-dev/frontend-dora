"use client";

import { CircleCheck, Users } from "lucide-react";
import {
  Badge,
  DataTable,
  EmptyState,
  type DataTableColumn,
} from "@/design-system";
import {
  formatBookingPeriod,
  formatSlot,
} from "@/features/bookings/model/booking-labels";
import type { GateGuest } from "@/shared/contracts/bookings";
import { formatTime } from "@/shared/lib/datetime";
import { formatDocument } from "@/shared/lib/identity-document";

const documentOf = (guest: GateGuest) =>
  formatDocument(guest.documentType, guest.document) || "Sem documento";

const whereOf = (guest: GateGuest) =>
  `${guest.spaceName} · ${formatSlot(guest.startsAt, guest.endsAt)}`;

const COLUMNS: DataTableColumn<GateGuest>[] = [
  {
    key: "name",
    label: "Convidado",
    mobile: "title",
    render: (guest) => (
      <span className="flex min-w-0 flex-col">
        <span className="truncate font-medium text-fg">{guest.name}</span>
        <span className="truncate text-xs text-soft">{documentOf(guest)}</span>
      </span>
    ),
    renderMobile: (guest) => (
      <span className="block truncate text-sm font-semibold text-fg">
        {guest.name}
      </span>
    ),
  },
  {
    key: "where",
    label: "Espaço e horário",
    mobile: "subtitle",
    render: whereOf,
    renderMobile: (guest) => (
      <span className="block truncate text-xs text-muted">
        {whereOf(guest)}
      </span>
    ),
  },
  // Phones only: the first lines under the chevron are the full date and
  // time and the space (the card's subtitle may be cut).
  {
    key: "when",
    label: "Quando",
    desktop: "hidden",
    render: (guest) => (
      <span className="block first-letter:uppercase">
        {formatBookingPeriod(guest)}
      </span>
    ),
  },
  {
    key: "space",
    label: "Espaço",
    desktop: "hidden",
    render: (guest) => guest.spaceName,
  },
  {
    key: "host",
    label: "Quem convidou",
    render: (guest) => (
      <span className="flex min-w-0 flex-col">
        <span className="truncate text-fg">{guest.hostName}</span>
        {guest.unitLabel && (
          <span className="truncate text-xs text-soft">{guest.unitLabel}</span>
        )}
      </span>
    ),
    renderMobile: (guest) =>
      guest.unitLabel
        ? `${guest.hostName} · ${guest.unitLabel}`
        : guest.hostName,
  },
  {
    key: "entry",
    label: "Entrada",
    mobile: "control",
    className: "whitespace-nowrap",
    render: (guest) =>
      guest.checkedInAt ? (
        <Badge tone="success">
          <CircleCheck aria-hidden className="mr-1 size-3.5" />
          Entrou às {formatTime(guest.checkedInAt)}
        </Badge>
      ) : (
        <Badge tone="neutral">Não entrou</Badge>
      ),
    renderMobile: (guest) =>
      guest.checkedInAt ? (
        <Badge tone="success">{formatTime(guest.checkedInAt)}</Badge>
      ) : (
        <Badge tone="neutral">Não entrou</Badge>
      ),
  },
  {
    key: "document",
    label: "Documento",
    desktop: "hidden",
    render: documentOf,
  },
];

// A day's guests for the managers, as the API filtered them: who, where
// and when, who invited and whether they came in. On phones a card with
// the name, the booking and the entry; the chevron opens who invited and
// the document. Read-only: the gate (Portaria) lets them in.
export function BookingGuestsTable({
  guests,
  filtered,
}: {
  guests: GateGuest[];
  /** Some filter is on (the empty state says so). */
  filtered: boolean;
}) {
  return guests.length === 0 ? (
    <EmptyState
      icon={<Users className="size-5" />}
      title={
        filtered ? "Nenhum convidado encontrado" : "Nenhum convidado neste dia"
      }
      description={
        filtered
          ? "Tente outros filtros."
          : "Os convidados das reservas do dia aparecem aqui."
      }
    />
  ) : (
    <DataTable rows={guests} columns={COLUMNS} getId={(guest) => guest.id} />
  );
}
