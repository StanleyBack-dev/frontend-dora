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
import { formatCents, formatDateTime } from "@/shared/lib/format";

const amount = (order: EventOrder) =>
  order.totalCents > 0 ? formatCents(order.totalCents) : "Grátis";

// The columns: who ordered, the unit, the people, the amount and the
// status; when it was ordered goes under the row (and into the phone card).
const COLUMNS: DataTableColumn<EventOrder>[] = [
  {
    key: "order",
    label: "Pedido",
    mobile: "title",
    render: (order) => (
      <span className="flex flex-col">
        <span className="font-semibold text-fg">
          {order.buyerName ?? "Conta removida"}
        </span>
        <span className="font-mono text-xs text-soft">{order.code}</span>
      </span>
    ),
    renderMobile: (order) => (
      <>
        <span className="font-mono">{order.code}</span> ·{" "}
        {order.buyerName ?? "Conta removida"}
      </>
    ),
  },
  {
    key: "unit",
    label: "Unidade",
    className: "whitespace-nowrap",
    render: (order) => order.unitLabel ?? "—",
  },
  {
    key: "people",
    label: "Pessoas",
    className: "whitespace-nowrap",
    render: (order) => peopleCount(order),
  },
  {
    key: "amount",
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
  {
    key: "createdAt",
    label: "Pedido em",
    desktop: "detail",
    render: (order) => formatDateTime(order.createdAt),
  },
];

// An event's orders for whoever reviews payments, in the list table: a row
// per order and, under its chevron, the people, the PIX, the receipt and
// the decision. What waits for review comes open.
export function EventOrdersReview({ orders }: { orders: EventOrder[] }) {
  if (orders.length === 0) {
    return (
      <EmptyState
        title="Nenhum pedido aqui"
        description="Os pedidos desta situação aparecem nesta lista."
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
        <div className="border-t border-border">
          <EventOrderDetails order={order} />
        </div>
      )}
    />
  );
}
