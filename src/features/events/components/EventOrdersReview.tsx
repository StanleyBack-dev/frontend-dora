"use client";

import {
  Badge,
  DataTable,
  EmptyState,
  type DataTableColumn,
} from "@/design-system";
import { EventOrderDetails } from "@/features/events/components/EventOrderDetails";
import {
  ORDER_STATUS,
  peopleCount,
} from "@/features/events/model/order-labels";
import type { EventOrder } from "@/shared/contracts/events";
import { formatCents } from "@/shared/lib/format";

/** Whose tickets these are: up to two names and how many more. */
const holders = (order: EventOrder) => {
  const names = order.attendees.map((person) => person.name);
  const more = names.length - 2;
  return more > 0
    ? `${names.slice(0, 2).join(", ")} +${more}`
    : names.join(", ");
};

const amount = (order: EventOrder) =>
  order.totalCents > 0 ? formatCents(order.totalCents) : "Grátis";

// The columns: who ordered, whose tickets, the unit, the amount and the
// status (on phones: whose tickets, a summary line and the status; who
// ordered goes inside). The code, the dates, the people and the receipt
// open under the row.
const COLUMNS: DataTableColumn<EventOrder>[] = [
  {
    key: "buyer",
    label: "Quem pediu",
    // Phones: inside the card (its title is whose tickets).
    mobile: "hidden",
    render: (order) => (
      <span className="font-semibold text-fg">
        {order.buyerName ?? "Conta removida"}
      </span>
    ),
  },
  {
    key: "holders",
    label: "Ingressos de",
    mobile: "title",
    render: (order) => (
      <span
        className="block max-w-56 truncate text-fg"
        title={order.attendees.map((person) => person.name).join(", ")}
      >
        {holders(order)}
      </span>
    ),
  },
  {
    key: "unit",
    mobile: "hidden",
    label: "Unidade",
    className: "whitespace-nowrap",
    render: (order) => order.unitLabel ?? "—",
  },
  {
    key: "amount",
    mobile: "hidden",
    label: "Valor",
    className: "whitespace-nowrap",
    render: amount,
  },
  {
    key: "status",
    label: "Situação",
    mobile: "control",
    render: (order) => (
      <Badge tone={ORDER_STATUS[order.status].tone}>
        {ORDER_STATUS[order.status].label}
      </Badge>
    ),
  },
  {
    key: "subtitle",
    label: "Resumo",
    mobile: "subtitle",
    desktop: "hidden",
    render: (order) =>
      [order.unitLabel, peopleCount(order), amount(order)]
        .filter(Boolean)
        .join(" · "),
  },
];

// An event's orders for whoever reviews payments, in the list table: a row
// per order and, under its chevron, the people, the PIX, the receipt and
// the decision. What waits for review comes open.
export function EventOrdersReview({
  orders,
  filtered = false,
}: {
  orders: EventOrder[];
  /** Some filter is on (the empty state says so). */
  filtered?: boolean;
}) {
  if (orders.length === 0) {
    return (
      <EmptyState
        title={filtered ? "Nenhum pedido encontrado" : "Nenhum pedido ainda"}
        description={
          filtered
            ? "Tente outros filtros."
            : "Os pedidos dos moradores aparecem aqui."
        }
      />
    );
  }
  return (
    <DataTable
      rows={orders}
      columns={COLUMNS}
      getId={(order) => order.id}
      initiallyOpen={(order) => order.status === "AWAITING_REVIEW"}
      renderDesktopExpanded={(order) => <EventOrderDetails order={order} />}
      renderExpanded={(order) => (
        <div className="border-t border-border bg-surface-muted/40 px-3 py-3">
          <EventOrderDetails order={order} showBuyer />
        </div>
      )}
    />
  );
}
