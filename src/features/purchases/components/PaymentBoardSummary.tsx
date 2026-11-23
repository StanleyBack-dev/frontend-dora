import { CalendarClock, CalendarX, CircleCheckBig, Wallet } from "lucide-react";
import { StatCard, StatGrid } from "@/design-system";
import type { PaymentBoardOverview } from "@/shared/contracts/purchase-orders";
import { installmentsCount } from "@/features/purchases/model/order-labels";
import { formatCents } from "@/shared/lib/format";

/**
 * The bills to pay in numbers, whatever the filters: what is open, overdue,
 * due in the next 7 days, and what was paid this month.
 */
export function PaymentBoardSummary({
  overview,
}: {
  overview: PaymentBoardOverview;
}) {
  return (
    <StatGrid>
      <StatCard
        label="Em aberto"
        value={formatCents(overview.openCents)}
        hint={`${installmentsCount(overview.openCount)} a pagar.`}
        icon={<Wallet className="size-4" />}
        tone="neutral"
      />
      <StatCard
        label="Vencidas"
        value={formatCents(overview.overdueCents)}
        hint={`${installmentsCount(overview.overdueCount)} com o vencimento passado.`}
        icon={<CalendarX className="size-4" />}
        tone={overview.overdueCount > 0 ? "danger" : "neutral"}
      />
      <StatCard
        label="Vencem em 7 dias"
        value={formatCents(overview.dueSoonCents)}
        hint={`${installmentsCount(overview.dueSoonCount)} até a próxima semana.`}
        icon={<CalendarClock className="size-4" />}
        tone={overview.dueSoonCount > 0 ? "warning" : "neutral"}
      />
      <StatCard
        label="Pagas no mês"
        value={formatCents(overview.paidThisMonthCents)}
        hint={`${installmentsCount(overview.paidThisMonthCount)} neste mês.`}
        icon={<CircleCheckBig className="size-4" />}
        tone="success"
      />
    </StatGrid>
  );
}
