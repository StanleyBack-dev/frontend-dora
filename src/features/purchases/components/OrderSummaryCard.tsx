import { FileText } from "lucide-react";
import { Badge, FactList } from "@/design-system";
import { OrderActions } from "@/features/purchases/components/OrderActions";
import { SectionCard } from "@/features/purchases/components/SectionCard";
import { ReceiptPdfButton } from "@/features/signature/components/ReceiptPdfButton";
import {
  orderCode,
  paymentLabel,
} from "@/features/purchases/model/order-labels";
import {
  formatRequestDay,
  REQUEST_STATUS_LABELS,
  REQUEST_STATUS_TONES,
} from "@/features/purchases/model/request-labels";
import type { PurchaseOrder } from "@/shared/contracts/purchase-orders";
import type { PurchaseRequest } from "@/shared/contracts/purchase-requests";
import { formatDateTime } from "@/shared/lib/datetime";
import { formatCents } from "@/shared/lib/format";

/**
 * The order placed: its code and where it stands, the supplier, total,
 * payment, delivery expected and who placed it; the purchase order PDF and,
 * for the management, sending it to the supplier and cancelling it (nothing
 * received nor paid). The gate sees no values.
 */
export function OrderSummaryCard({
  request,
  order,
  canSeeMoney,
  canManage,
}: {
  request: PurchaseRequest;
  order: PurchaseOrder;
  canSeeMoney: boolean;
  canManage: boolean;
}) {
  const code = orderCode(order.number);
  const facts = [
    { label: "Fornecedor", value: order.supplierName },
    {
      label: "Total",
      value: order.totalCents !== null ? formatCents(order.totalCents) : null,
    },
    {
      label: "Pagamento",
      value: canSeeMoney
        ? paymentLabel(order, order.installments.length)
        : null,
    },
    {
      label: "Entrega prevista",
      value: order.expectedOn
        ? formatRequestDay(order.expectedOn)
        : "A combinar",
    },
    {
      label: "Pedido por",
      value: `${order.orderedByName ?? "—"} · ${formatDateTime(order.orderedAt)}`,
    },
    {
      label: "Concluída em",
      value: order.completedAt ? formatDateTime(order.completedAt) : null,
    },
  ];

  return (
    <SectionCard
      icon={<FileText />}
      title={`Pedido ${code}`}
      description="A ordem de compra enviada ao fornecedor."
      actions={
        canSeeMoney ? (
          <>
            <ReceiptPdfButton
              path={`/purchases/requests/${request.id}/order/pdf`}
              fallbackName={`ordem-de-compra-${code}.pdf`}
              label="Ordem de compra (PDF)"
              variant="brand"
              className="justify-center"
            />
            {canManage && (
              <OrderActions
                requestId={request.id}
                requestTitle={request.title}
                order={order}
                cancellable={
                  request.status === "ORDERED" &&
                  order.receipts.length === 0 &&
                  order.installments.every((item) => !item.paidOn)
                }
              />
            )}
          </>
        ) : undefined
      }
    >
      <Badge tone={REQUEST_STATUS_TONES[request.status]}>
        {REQUEST_STATUS_LABELS[request.status]}
      </Badge>
      <FactList facts={facts} />
      {order.notes && (
        <p className="text-sm break-words text-fg">
          <span className="text-muted">Observações:</span> {order.notes}
        </p>
      )}
    </SectionCard>
  );
}
