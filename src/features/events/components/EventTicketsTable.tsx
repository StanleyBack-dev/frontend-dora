"use client";

import { CircleCheck, Ticket } from "lucide-react";
import {
  Badge,
  DataTable,
  EmptyState,
  cn,
  type DataTableColumn,
} from "@/design-system";
import { CopyShareValue } from "@/features/admin/components/CopyShareValue";
import type { GateEventTicket } from "@/shared/contracts/events";
import { formatTime } from "@/shared/lib/datetime";

// An event's tickets for its managers, as the API filtered them. Each row:
// the person (who ordered stands out), the age, the entry and the ticket;
// the chevron opens the unit, who ordered and the codes to copy.
// Read-only: the gate (Portaria) lets people in.
export function EventTicketsTable({
  tickets,
  filtered,
}: {
  tickets: GateEventTicket[];
  /** Some filter is on (the empty state says so). */
  filtered: boolean;
}) {
  const columns: DataTableColumn<GateEventTicket>[] = [
    {
      key: "name",
      label: "Pessoa",
      mobile: "title",
      render: (ticket) => <PersonName ticket={ticket} />,
      renderMobile: (ticket) => <PersonName ticket={ticket} phone />,
    },
    {
      key: "age",
      label: "Idade",
      mobile: "hidden",
      className: "whitespace-nowrap",
      render: (ticket) => `${ticket.age} anos`,
    },
    {
      key: "entry",
      label: "Entrada",
      // Phones: beside "Quem pediu", in the person's tags.
      mobile: "hidden",
      className: "whitespace-nowrap",
      render: (ticket) => <EntryBadge ticket={ticket} />,
    },
    {
      key: "type",
      label: "Ingresso",
      render: (ticket) => ticket.ticketName ?? "Inscrição",
    },
    // Under the row: where they live, who ordered and the codes to copy.
    {
      key: "unit",
      label: "Unidade",
      desktop: "detail",
      render: (ticket) => ticket.unitLabel ?? "—",
    },
    {
      key: "buyer",
      label: "Pedido por",
      desktop: "detail",
      render: (ticket) =>
        ticket.source === "SELF"
          ? "A própria pessoa"
          : (ticket.buyerName ?? "Conta removida"),
    },
    {
      key: "ticketCode",
      label: "Código do ingresso",
      desktop: "detail",
      render: (ticket) => (
        <CopyShareValue
          value={ticket.ticketCode}
          label="Código do ingresso"
          share={false}
          valueClassName="font-mono text-fg"
        />
      ),
    },
    {
      key: "orderCode",
      label: "Código do pedido",
      desktop: "detail",
      render: (ticket) => (
        <CopyShareValue
          value={ticket.orderCode}
          label="Código do pedido"
          share={false}
          valueClassName="font-mono text-fg"
        />
      ),
    },
  ];

  return tickets.length === 0 ? (
    <EmptyState
      icon={<Ticket className="size-5" />}
      title={filtered ? "Nenhum ingresso encontrado" : "Nenhum ingresso ainda"}
      description={
        filtered
          ? "Tente outros filtros."
          : "Os ingressos aparecem quando os pedidos forem confirmados."
      }
    />
  ) : (
    <DataTable rows={tickets} columns={columns} getId={(ticket) => ticket.id} />
  );
}

// Whether the person came in (and when).
function EntryBadge({ ticket }: { ticket: GateEventTicket }) {
  return ticket.checkedInAt ? (
    <Badge tone="success">
      <CircleCheck aria-hidden className="mr-1 size-3.5" />
      Entrou às {formatTime(ticket.checkedInAt)}
    </Badge>
  ) : (
    <Badge tone="neutral">Não entrou</Badge>
  );
}

// The person of a ticket: who ordered stands out (a "Quem pediu" badge
// and the name in bold); the others say whose order they came in. On
// phones the age goes beside the name and the tags (Quem pediu, the entry,
// De fora) sit side by side on one line under it.
function PersonName({
  ticket,
  phone = false,
}: {
  ticket: GateEventTicket;
  /** The phone card: age beside the name, every tag on one line. */
  phone?: boolean;
}) {
  const buyer = ticket.source === "SELF";
  const name = (
    <span
      className={cn(
        "truncate",
        buyer ? "font-bold text-fg" : "font-medium text-fg",
      )}
    >
      {ticket.name}
    </span>
  );
  const orderOf = !buyer && (
    <span className="truncate text-xs text-soft">
      No pedido de {ticket.buyerName ?? "morador"}
    </span>
  );

  if (phone) {
    return (
      <span className="flex min-w-0 flex-col gap-1">
        <span className="flex min-w-0 items-baseline gap-2">
          {name}
          <span className="shrink-0 text-xs font-normal text-soft">
            {ticket.age} anos
          </span>
        </span>
        <span className="flex flex-wrap items-center gap-1.5">
          {buyer && <Badge tone="brand">Quem pediu</Badge>}
          <EntryBadge ticket={ticket} />
          {ticket.outside && <Badge tone="neutral">De fora</Badge>}
        </span>
        {orderOf}
      </span>
    );
  }

  return (
    <span className="flex min-w-0 flex-col gap-0.5">
      <span className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
        {name}
        {buyer && <Badge tone="brand">Quem pediu</Badge>}
        {ticket.outside && <Badge tone="neutral">De fora</Badge>}
      </span>
      {orderOf}
    </span>
  );
}
