import { CalendarClock, CalendarX, ClipboardList, Siren } from "lucide-react";
import { StatCard, StatGrid } from "@/design-system";
import type { PurchaseRequestOverview } from "@/shared/contracts/purchase-requests";

// The purchase requests in numbers, whatever the filters (four cards, one
// row on desktop): what waits for quotes and what is pressing.
export function PurchaseRequestsSummary({
  overview,
}: {
  overview: PurchaseRequestOverview;
}) {
  return (
    <StatGrid>
      <StatCard
        label="Aguardando cotação"
        value={String(overview.open)}
        icon={<ClipboardList className="size-4" />}
        tone="warning"
      />
      <StatCard
        label="Urgentes"
        value={String(overview.urgent)}
        hint="Em andamento, com prioridade urgente."
        icon={<Siren className="size-4" />}
        tone={overview.urgent > 0 ? "danger" : "neutral"}
      />
      <StatCard
        label="Prazo em até 7 dias"
        value={String(overview.dueSoon)}
        hint="Em andamento, precisam até a próxima semana."
        icon={<CalendarClock className="size-4" />}
        tone={overview.dueSoon > 0 ? "info" : "neutral"}
      />
      <StatCard
        label="Atrasadas"
        value={String(overview.overdue)}
        hint="Em andamento, com o prazo já passado."
        icon={<CalendarX className="size-4" />}
        tone={overview.overdue > 0 ? "danger" : "neutral"}
      />
    </StatGrid>
  );
}
