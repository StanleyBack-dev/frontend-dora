import { CalendarX, PackageCheck, PackageOpen, Truck } from "lucide-react";
import { StatCard, StatGrid } from "@/design-system";
import type { DeliveryBoardOverview } from "@/shared/contracts/purchase-orders";

/**
 * The deliveries in numbers, whatever the filters: the orders waiting for
 * their delivery, the late ones, the ones arrived in part and this month's
 * deliveries.
 */
export function DeliveryBoardSummary({
  overview,
}: {
  overview: DeliveryBoardOverview;
}) {
  return (
    <StatGrid>
      <StatCard
        label="Aguardando entrega"
        value={String(overview.awaitingDelivery)}
        hint="Pedidos feitos, falta chegar."
        icon={<Truck className="size-4" />}
        tone={overview.awaitingDelivery > 0 ? "info" : "neutral"}
      />
      <StatCard
        label="Atrasadas"
        value={String(overview.lateDeliveries)}
        hint="Passaram da entrega prevista."
        icon={<CalendarX className="size-4" />}
        tone={overview.lateDeliveries > 0 ? "danger" : "neutral"}
      />
      <StatCard
        label="Chegaram em parte"
        value={String(overview.partialDeliveries)}
        hint="Falta o restante dos itens."
        icon={<PackageOpen className="size-4" />}
        tone={overview.partialDeliveries > 0 ? "warning" : "neutral"}
      />
      <StatCard
        label="Entregas no mês"
        value={String(overview.receiptsThisMonth)}
        hint="Registradas neste mês."
        icon={<PackageCheck className="size-4" />}
        tone="success"
      />
    </StatGrid>
  );
}
