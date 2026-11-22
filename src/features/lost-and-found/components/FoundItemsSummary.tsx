import { Archive, Clock, HandHelping, PackageCheck } from "lucide-react";
import { StatCard, StatGrid } from "@/design-system";
import type {
  FoundItemOverview,
  FoundItemStatus,
} from "@/shared/contracts/lost-and-found";

// The condominium's found items in numbers, whatever the filters (four
// cards, one row on desktop).
export function FoundItemsSummary({
  overview,
}: {
  overview: FoundItemOverview;
}) {
  const count = (status: FoundItemStatus) =>
    overview.byStatus.find((item) => item.status === status)?.count ?? 0;

  return (
    <StatGrid>
      <StatCard
        label="Guardados"
        value={String(count("FOUND"))}
        icon={<Archive className="size-4" />}
        tone="warning"
      />
      <StatCard
        label="Pedidos aguardando"
        value={String(overview.pendingClaims)}
        hint="Moradores dizendo que um item é seu."
        icon={<HandHelping className="size-4" />}
        tone={overview.pendingClaims > 0 ? "info" : "neutral"}
      />
      <StatCard
        label="Guarda terminando"
        value={String(overview.expiringSoon)}
        hint="Prazo de guarda acaba em até 7 dias."
        icon={<Clock className="size-4" />}
        tone={overview.expiringSoon > 0 ? "danger" : "neutral"}
      />
      <StatCard
        label="Devolvidos"
        value={String(count("RETURNED"))}
        icon={<PackageCheck className="size-4" />}
        tone="success"
      />
    </StatGrid>
  );
}
