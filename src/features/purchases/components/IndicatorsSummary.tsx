import { BadgePercent, ClipboardCheck, HandCoins, Wallet } from "lucide-react";
import { StatCard, StatGrid } from "@/design-system";
import { purchasesCount } from "@/features/purchases/model/indicator-labels";
import { installmentsCount } from "@/features/purchases/model/order-labels";
import type { PurchaseIndicators } from "@/shared/contracts/purchase-indicators";
import { formatCents } from "@/shared/lib/format";

/**
 * The period's purchases in four figures: what was paid, what placed orders
 * still owe (today), the savings against the highest quotes and the orders
 * placed (how many with three quotes or more).
 */
export function IndicatorsSummary({ data }: { data: PurchaseIndicators }) {
  const { process } = data;
  return (
    <StatGrid>
      <StatCard
        label="Pago no período"
        value={formatCents(data.paidCents)}
        hint={
          data.purchases === 0
            ? "Nada pago no período."
            : `${purchasesCount(data.purchases)} · ${installmentsCount(data.paidInstallments)}.`
        }
        icon={<Wallet className="size-4" />}
        tone="brand"
      />
      <StatCard
        label="Comprometido"
        value={formatCents(data.committed.cents)}
        hint={`${installmentsCount(data.committed.installments)} a pagar hoje.`}
        icon={<HandCoins className="size-4" />}
        tone={data.committed.cents > 0 ? "warning" : "neutral"}
      />
      <StatCard
        label="Economia"
        value={formatCents(process.savingsCents)}
        hint="Frente à maior cotação de cada compra."
        icon={<BadgePercent className="size-4" />}
        tone={process.savingsCents > 0 ? "success" : "neutral"}
      />
      <StatCard
        label="Pedidos feitos"
        value={process.orders}
        hint={`${process.withThreeQuotes} com 3 ou mais cotações.`}
        icon={<ClipboardCheck className="size-4" />}
        tone="neutral"
      />
    </StatGrid>
  );
}
