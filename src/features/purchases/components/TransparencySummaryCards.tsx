import { CircleCheckBig, Shapes, Trophy, Wallet } from "lucide-react";
import { StatCard, StatGrid } from "@/design-system";
import { CATEGORY_LABELS } from "@/features/catalog/model/categories";
import { purchasesCount } from "@/features/purchases/model/indicator-labels";
import type { TransparencySummary } from "@/shared/contracts/purchase-indicators";
import { formatCents } from "@/shared/lib/format";

/**
 * The accounts of the period in four figures: what was paid, the purchases
 * completed, the categories with spending and the largest of them.
 */
export function TransparencySummaryCards({
  summary,
  completed,
}: {
  summary: TransparencySummary;
  /** Purchases completed in the period. */
  completed: number;
}) {
  const largest = summary.byCategory[0];
  return (
    <StatGrid>
      <StatCard
        label="Pago no período"
        value={formatCents(summary.paidCents)}
        hint={
          summary.purchases === 0
            ? "Nada pago no período."
            : `Em ${purchasesCount(summary.purchases)}.`
        }
        icon={<Wallet className="size-4" />}
        tone="brand"
      />
      <StatCard
        label="Compras concluídas"
        value={completed}
        hint="Recebidas e pagas."
        icon={<CircleCheckBig className="size-4" />}
        tone="success"
      />
      <StatCard
        label="Categorias"
        value={summary.byCategory.length}
        hint="Com gasto no período."
        icon={<Shapes className="size-4" />}
        tone="neutral"
      />
      <StatCard
        label="Maior gasto"
        value={largest ? formatCents(largest.cents) : "—"}
        hint={largest ? CATEGORY_LABELS[largest.category] : "Nada no período."}
        icon={<Trophy className="size-4" />}
        tone="neutral"
      />
    </StatGrid>
  );
}
