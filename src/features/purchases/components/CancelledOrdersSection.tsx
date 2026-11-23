import { Ban } from "lucide-react";
import { CollapsibleSection } from "@/design-system";
import { orderCode } from "@/features/purchases/model/order-labels";
import type { CancelledPurchaseOrder } from "@/shared/contracts/purchase-orders";
import { formatDateTime } from "@/shared/lib/datetime";
import { formatCents } from "@/shared/lib/format";

/**
 * The orders of a purchase cancelled before: code, supplier, value (when
 * seen), who cancelled, when and why. Open while the purchase waits for a
 * new order, folded once there is one.
 */
export function CancelledOrdersSection({
  orders,
  defaultOpen,
}: {
  orders: CancelledPurchaseOrder[];
  defaultOpen: boolean;
}) {
  if (orders.length === 0) return null;
  return (
    <CollapsibleSection
      icon={<Ban className="size-4" />}
      title={`Pedidos cancelados (${orders.length})`}
      description="Os pedidos desta compra que foram cancelados, com o motivo."
      defaultOpen={defaultOpen}
    >
      <ul className="space-y-2">
        {orders.map((order) => (
          <li
            key={order.number}
            className="rounded-xl border border-border px-3 py-2.5"
          >
            <p className="text-sm font-medium text-fg">
              {orderCode(order.number)} · {order.supplierName}
              {order.totalCents !== null &&
                ` · ${formatCents(order.totalCents)}`}
            </p>
            <p className="text-xs text-muted">
              Feito em {formatDateTime(order.orderedAt)} · cancelado por{" "}
              {order.cancelledByName ?? "—"} em{" "}
              {formatDateTime(order.cancelledAt)}
            </p>
            <p className="mt-1 text-sm break-words text-fg">
              <span className="text-muted">Motivo:</span> {order.reason}
            </p>
          </li>
        ))}
      </ul>
    </CollapsibleSection>
  );
}
