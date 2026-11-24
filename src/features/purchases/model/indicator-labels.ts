import type { ColumnChartItem } from "@/design-system";
import { CATEGORY_LABELS } from "@/features/catalog/model/categories";
import type {
  CategorySpend,
  IndicatorPeriod,
  MonthSpend,
} from "@/shared/contracts/purchase-indicators";
import { formatCents } from "@/shared/lib/format";

export const MONTHS = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

/** The first year the period filter offers. */
const FIRST_YEAR = 2024;

/** "Ano de 2026", "Novembro de 2026". */
export const periodLabel = (period: IndicatorPeriod) =>
  period.month === null
    ? `Ano de ${period.year}`
    : `${MONTHS[period.month - 1]} de ${period.year}`;

/** The years to choose, the current one first. */
export const yearOptions = (current: number) =>
  Array.from({ length: Math.max(1, current - FIRST_YEAR + 1) }, (_, index) =>
    String(current - index),
  );

/**
 * The period of a page's query (?ano=2026&mes=11); by default the current
 * year, from January to now.
 */
export function readPeriod(
  ano: string | undefined,
  mes: string | undefined,
  current: number,
): IndicatorPeriod {
  const year = Number(ano);
  const month = Number(mes);
  return {
    year:
      Number.isInteger(year) && year >= FIRST_YEAR && year <= current
        ? year
        : current,
    month: Number.isInteger(month) && month >= 1 && month <= 12 ? month : null,
  };
}

/** The query of a period ("ano=2026&mes=11"), for links and the PDF. */
export const periodQuery = (period: IndicatorPeriod) =>
  `ano=${period.year}${period.month === null ? "" : `&mes=${period.month}`}`;

const percent = (part: number, whole: number) =>
  whole === 0
    ? "0%"
    : `${((part / whole) * 100).toLocaleString("pt-BR", { maximumFractionDigits: 1 })}%`;

/** "Nenhuma compra", "1 compra", "3 compras". */
export const purchasesCount = (value: number) =>
  value === 0
    ? "Nenhuma compra"
    : value === 1
      ? "1 compra"
      : `${value} compras`;

/** The categories as bars: the value, its share and how many purchases. */
export const categoryBars = (rows: CategorySpend[], paidCents: number) =>
  rows.map((row) => ({
    key: row.category,
    label: CATEGORY_LABELS[row.category],
    value: row.cents,
    valueLabel: formatCents(row.cents),
    hint: `${purchasesCount(row.purchases)} · ${percent(row.cents, paidCents)} do total`,
  }));

/** The year's months as columns ("jan" … "dez"). */
export const monthColumns = (
  rows: MonthSpend[],
  year: number,
): ColumnChartItem[] =>
  rows.map((row) => ({
    key: String(row.month),
    label: MONTHS[row.month - 1].slice(0, 3).toLowerCase(),
    fullLabel: `${MONTHS[row.month - 1]} de ${year}`,
    value: row.cents,
    valueLabel: formatCents(row.cents),
  }));

/**
 * "2,5 dias em média"; under a day, "No mesmo dia" (0) or "Menos de 1 dia"
 * (null: "—").
 */
export function averageDays(value: number | null): string {
  if (value === null) return "—";
  if (value === 0) return "No mesmo dia";
  if (value < 1) return "Menos de 1 dia";
  return `${value.toLocaleString("pt-BR", { maximumFractionDigits: 1 })} ${value === 1 ? "dia" : "dias"} em média`;
}
