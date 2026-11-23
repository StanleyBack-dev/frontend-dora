import { CircleCheckBig, ClipboardCheck, Truck, Wallet } from "lucide-react";
import { StatCard, StatGrid } from "@/design-system";
import type { OrderBoardOverview } from "@/shared/contracts/purchase-orders";
import { installmentsCount } from "@/features/purchases/model/order-labels";
import { formatCents } from "@/shared/lib/format";

/**
 * The orders in numbers, whatever the filters (four cards): the approved
 * purchases still to order, the deliveries awaited, what is left to pay
 * (and how much is overdue) and this month's completed purchases.
 */
export function OrderBoardSummary({
  overview,
}: {
  overview: OrderBoardOverview;
}) {
  return (
    <StatGrid>
      <StatCard
        label="Pedido a fazer"
        value={String(overview.toOrder)}
        hint="Aprovadas, falta pedir ao fornecedor."
        icon={<ClipboardCheck className="size-4" />}
        tone={overview.toOrder > 0 ? "warning" : "neutral"}
      />
      <StatCard
        label="Aguardando entrega"
        value={String(overview.awaitingDelivery)}
        hint="Pedido feito, falta chegar (tudo ou parte)."
        icon={<Truck className="size-4" />}
        tone={overview.awaitingDelivery > 0 ? "info" : "neutral"}
      />
      <StatCard
        label="A pagar"
        value={formatCents(overview.unpaidCents)}
        hint={
          overview.overdueInstallments > 0
            ? `${installmentsCount(overview.unpaidInstallments)}, ${overview.overdueInstallments} ${overview.overdueInstallments === 1 ? "vencida" : "vencidas"}.`
            : `${installmentsCount(overview.unpaidInstallments)} em aberto.`
        }
        icon={<Wallet className="size-4" />}
        tone={overview.overdueInstallments > 0 ? "danger" : "neutral"}
      />
      <StatCard
        label="Concluídas no mês"
        value={String(overview.completedThisMonth)}
        hint="Recebidas e pagas."
        icon={<CircleCheckBig className="size-4" />}
        tone="success"
      />
    </StatGrid>
  );
}
