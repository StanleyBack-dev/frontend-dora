import { BadgeCheck, CircleX, Hourglass, Undo2 } from "lucide-react";
import { StatCard, StatGrid } from "@/design-system";
import type { ApprovalOverview } from "@/shared/contracts/purchase-approvals";

// The approvals in numbers, whatever the filters (four cards): what waits
// for a decision, and this month's approved (within the limit too),
// returned and rejected.
export function ApprovalBoardSummary({
  overview,
}: {
  overview: ApprovalOverview;
}) {
  return (
    <StatGrid>
      <StatCard
        label="Aguardando aprovação"
        value={String(overview.awaiting)}
        hint="Cotação escolhida, falta decidir."
        icon={<Hourglass className="size-4" />}
        tone={overview.awaiting > 0 ? "warning" : "neutral"}
      />
      <StatCard
        label="Aprovadas no mês"
        value={String(overview.approvedThisMonth)}
        hint="Por quem aprova ou dentro da alçada."
        icon={<BadgeCheck className="size-4" />}
        tone="success"
      />
      <StatCard
        label="Devolvidas no mês"
        value={String(overview.returnedThisMonth)}
        hint="Voltaram para cotação, com o motivo."
        icon={<Undo2 className="size-4" />}
        tone="info"
      />
      <StatCard
        label="Reprovadas no mês"
        value={String(overview.rejectedThisMonth)}
        hint="Encerradas, com o motivo."
        icon={<CircleX className="size-4" />}
        tone={overview.rejectedThisMonth > 0 ? "danger" : "neutral"}
      />
    </StatGrid>
  );
}
