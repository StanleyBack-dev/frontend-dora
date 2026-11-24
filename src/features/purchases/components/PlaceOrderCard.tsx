"use client";

import { useState } from "react";
import { ClipboardCheck } from "lucide-react";
import { Alert, Button } from "@/design-system";
import { SectionCard } from "@/features/purchases/components/SectionCard";
import { PlaceOrderDrawer } from "@/features/purchases/components/PlaceOrderDrawer";
import { paymentLabel } from "@/features/purchases/model/order-labels";
import type { PurchaseOrderPlan } from "@/shared/contracts/purchase-orders";
import { formatCents } from "@/shared/lib/format";

/** "entrega em 3 dias". */
const deliveryTerm = (days: number) =>
  days === 0
    ? "entrega imediata"
    : `entrega em ${days === 1 ? "1 dia" : `${days} dias`}`;

/**
 * An approved purchase, the order still to place: what it will be (the
 * chosen quote's supplier, total, payment and delivery term) and, for the
 * management, "Fazer pedido", which opens the order's drawer.
 */
export function PlaceOrderCard({
  requestId,
  plan,
  canManage,
}: {
  requestId: string;
  plan: PurchaseOrderPlan | null;
  canManage: boolean;
}) {
  const [placing, setPlacing] = useState(false);

  if (!plan) {
    return (
      <Alert tone="info">
        Compra aprovada: aguardando a gestão fazer o pedido ao fornecedor.
      </Alert>
    );
  }
  const count = plan.installmentValues.length;

  return (
    <SectionCard
      icon={<ClipboardCheck />}
      title="Fazer o pedido"
      description={
        canManage
          ? "Compra aprovada: confira a cotação escolhida e faça o pedido ao fornecedor."
          : "Compra aprovada: aguardando a gestão fazer o pedido ao fornecedor."
      }
      actions={
        canManage ? (
          <Button
            variant="primary"
            className="justify-center"
            icon={<ClipboardCheck className="size-4" />}
            onClick={() => setPlacing(true)}
          >
            Fazer pedido
          </Button>
        ) : undefined
      }
    >
      <div className="rounded-xl border border-border bg-surface-muted/50 px-4 py-3">
        <p className="text-sm break-words text-fg">
          {plan.supplierName} ·{" "}
          <strong className="tabular-nums">
            {formatCents(plan.totalCents)}
          </strong>
        </p>
        <p className="text-xs text-muted">
          {paymentLabel(plan, count)}
          {plan.deliveryDays !== null &&
            ` · ${deliveryTerm(plan.deliveryDays)}`}
        </p>
      </div>
      {placing && (
        <PlaceOrderDrawer
          requestId={requestId}
          plan={plan}
          onClose={() => setPlacing(false)}
        />
      )}
    </SectionCard>
  );
}
