import { Clock, Package, PackageCheck, Undo2 } from "lucide-react";
import { StatCard, StatGrid } from "@/design-system";
import type { ParcelOverview, ParcelStatus } from "@/shared/contracts/parcels";

// The condominium's parcels in numbers, whatever the filters.
export function ParcelsSummary({ overview }: { overview: ParcelOverview }) {
  const count = (status: ParcelStatus) =>
    overview.byStatus.find((item) => item.status === status)?.count ?? 0;

  return (
    <StatGrid>
      <StatCard
        label="Aguardando retirada"
        value={String(count("RECEIVED"))}
        icon={<Package className="size-4" />}
        tone="warning"
      />
      <StatCard
        label="Há mais de 3 dias"
        value={String(overview.waitingLong)}
        hint="Os moradores já foram lembrados."
        icon={<Clock className="size-4" />}
        tone={overview.waitingLong > 0 ? "danger" : "neutral"}
      />
      <StatCard
        label="Retiradas"
        value={String(count("PICKED_UP"))}
        icon={<PackageCheck className="size-4" />}
        tone="success"
      />
      <StatCard
        label="Devolvidas ou canceladas"
        value={String(count("RETURNED") + count("CANCELLED"))}
        icon={<Undo2 className="size-4" />}
        tone="neutral"
      />
    </StatGrid>
  );
}
