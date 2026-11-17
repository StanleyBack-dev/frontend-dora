import type { EventOrder, EventOrderStatus } from "@/shared/contracts/events";

// The tabs of the order lists (an event's, and the queue of every event):
// the address's filter → the statuses it lists.
export const ORDER_FILTERS = {
  conferir: { label: "Para conferir", statuses: ["AWAITING_REVIEW"] },
  aguardando: { label: "Aguardando envio", statuses: ["PENDING_PAYMENT"] },
  confirmados: { label: "Confirmados", statuses: ["CONFIRMED"] },
  encerrados: {
    label: "Recusados e expirados",
    statuses: ["REJECTED", "EXPIRED", "CANCELLED"],
  },
} as const satisfies Record<
  string,
  { label: string; statuses: readonly EventOrderStatus[] }
>;

export type OrderFilter = keyof typeof ORDER_FILTERS;

export const ORDER_FILTER_KEYS = Object.keys(ORDER_FILTERS) as OrderFilter[];

/** The orders of one tab. */
export const ordersIn = (
  orders: EventOrder[],
  filter: OrderFilter,
): EventOrder[] =>
  orders.filter((order) =>
    (ORDER_FILTERS[filter].statuses as readonly EventOrderStatus[]).includes(
      order.status,
    ),
  );
