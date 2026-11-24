import { Gauge, Truck } from "lucide-react";
import { BarList, FactList } from "@/design-system";
import { SectionCard } from "@/features/purchases/components/SectionCard";
import {
  averageDays,
  purchasesCount,
} from "@/features/purchases/model/indicator-labels";
import type { PurchaseIndicators } from "@/shared/contracts/purchase-indicators";
import { formatCents } from "@/shared/lib/format";

const rating = (average: number | null, count: number) =>
  average === null
    ? "sem avaliação"
    : `${average.toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 })} de 5 (${count})`;

/**
 * The management's other two views of the period: who was paid (each
 * supplier's total, purchases and average rating) and how the orders placed
 * went (quotes, savings, time to order and to deliver, late deliveries).
 */
export function SupplierProcessCards({ data }: { data: PurchaseIndicators }) {
  const { process } = data;
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <SectionCard
        icon={<Truck />}
        title="Por fornecedor"
        description="Quanto foi pago a cada um, em quantas compras, e a avaliação média."
      >
        <BarList
          label="Pago por fornecedor"
          items={data.bySupplier.map((row) => ({
            key: row.supplierId ?? row.supplierName,
            label: row.supplierName,
            value: row.cents,
            valueLabel: formatCents(row.cents),
            hint: `${purchasesCount(row.purchases)} · ${rating(row.ratingAverage, row.ratingCount)}`,
          }))}
          empty="Nada pago no período."
        />
      </SectionCard>
      <SectionCard
        icon={<Gauge />}
        title="Processo"
        description="Os pedidos feitos no período: cotações, economia e prazos."
      >
        <FactList
          facts={[
            { label: "Pedidos feitos", value: String(process.orders) },
            {
              label: "Com 3 ou mais cotações",
              value: `${process.withThreeQuotes} de ${process.orders}`,
            },
            {
              label: "Economia frente à maior cotação",
              value: formatCents(process.savingsCents),
            },
            {
              label: "Da solicitação ao pedido",
              value: averageDays(process.avgDaysToOrder),
            },
            {
              label: "Do pedido à entrega",
              value: averageDays(process.avgDaysToDeliver),
            },
            {
              label: "Entregas atrasadas",
              value: String(process.lateDeliveries),
            },
          ]}
        />
      </SectionCard>
    </div>
  );
}
