import { CalendarRange, Shapes } from "lucide-react";
import { BarList, ColumnChart } from "@/design-system";
import { SectionCard } from "@/features/purchases/components/SectionCard";
import {
  categoryBars,
  monthColumns,
} from "@/features/purchases/model/indicator-labels";
import type {
  CategorySpend,
  IndicatorPeriod,
  MonthSpend,
} from "@/shared/contracts/purchase-indicators";

/**
 * What was paid, by category (bars with the value and share) and by month
 * of the year (columns; a chosen month stands out): the indicators' and the
 * accounts' shared charts.
 */
export function SpendCharts({
  period,
  paidCents,
  byCategory,
  byMonth,
}: {
  period: IndicatorPeriod;
  paidCents: number;
  byCategory: CategorySpend[];
  byMonth: MonthSpend[];
}) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <SectionCard
        icon={<Shapes />}
        title="Por categoria"
        description="Uma compra com mais de uma categoria tem o valor dividido entre elas."
      >
        <BarList
          label="Pago por categoria"
          items={categoryBars(byCategory, paidCents)}
          empty="Nada pago no período."
        />
      </SectionCard>
      <SectionCard
        icon={<CalendarRange />}
        title={`Por mês de ${period.year}`}
        description="Passe o dedo ou o mouse sobre um mês para ver o valor."
      >
        <ColumnChart
          label={`Pago por mês em ${period.year}`}
          items={monthColumns(byMonth, period.year)}
          highlight={period.month === null ? null : String(period.month)}
          empty={`Nada pago em ${period.year}.`}
        />
      </SectionCard>
    </div>
  );
}
