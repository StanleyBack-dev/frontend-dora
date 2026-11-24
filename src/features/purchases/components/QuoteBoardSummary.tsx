import { CircleAlert, ClipboardList, Hourglass, Scale } from "lucide-react";
import { StatCard, StatGrid } from "@/design-system";
import {
  MIN_QUOTES,
  type QuoteBoardOverview,
} from "@/shared/contracts/purchase-quotes";

/**
 * The quotes in numbers, whatever the filters (four cards, one row on
 * desktop): what waits for the first quote, what is in quotes (and short
 * of the recommended number) and what waits for the approval.
 */
export function QuoteBoardSummary({
  overview,
}: {
  overview: QuoteBoardOverview;
}) {
  return (
    <StatGrid>
      <StatCard
        label="Aguardando cotação"
        value={String(overview.awaitingQuotes)}
        hint="Ainda sem nenhuma cotação."
        icon={<ClipboardList className="size-4" />}
        tone={overview.awaitingQuotes > 0 ? "warning" : "neutral"}
      />
      <StatCard
        label="Em cotação"
        value={String(overview.quoting)}
        hint="Recebendo cotações dos fornecedores."
        icon={<Scale className="size-4" />}
        tone="info"
      />
      <StatCard
        label={`Com menos de ${MIN_QUOTES} cotações`}
        value={String(overview.belowMinimum)}
        hint="Em cotação, abaixo do recomendado."
        icon={<CircleAlert className="size-4" />}
        tone={overview.belowMinimum > 0 ? "danger" : "neutral"}
      />
      <StatCard
        label="Aguardando aprovação"
        value={String(overview.awaitingApproval)}
        hint="Cotação escolhida, falta aprovar."
        icon={<Hourglass className="size-4" />}
        tone={overview.awaitingApproval > 0 ? "warning" : "neutral"}
      />
    </StatGrid>
  );
}
