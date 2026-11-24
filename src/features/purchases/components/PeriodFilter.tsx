import {
  AutoFilterForm,
  FilterActions,
  FilterCombobox,
  FilterPanel,
} from "@/design-system";
import {
  MONTHS,
  yearOptions,
} from "@/features/purchases/model/indicator-labels";
import type { IndicatorPeriod } from "@/shared/contracts/purchase-indicators";

/**
 * The period of the purchases figures: a year (the current one by default)
 * and, optionally, one of its months. Applies on choosing.
 */
export function PeriodFilter({
  base,
  period,
  currentYear,
}: {
  /** The page's path (clearing goes back to it). */
  base: string;
  period: IndicatorPeriod;
  currentYear: number;
}) {
  const filtered = period.year !== currentYear || period.month !== null;
  return (
    <FilterPanel label="Período" hasActiveFilters={filtered}>
      <AutoFilterForm className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <FilterCombobox
          label="Ano"
          name="ano"
          defaultValue={period.year === currentYear ? "" : String(period.year)}
          placeholder={String(currentYear)}
          options={yearOptions(currentYear)
            .slice(1)
            .map((year) => ({ value: year, label: year }))}
        />
        <FilterCombobox
          label="Mês"
          name="mes"
          defaultValue={period.month === null ? "" : String(period.month)}
          placeholder="Ano todo"
          options={MONTHS.map((month, index) => ({
            value: String(index + 1),
            label: month,
          }))}
        />
        <FilterActions
          clearHref={base}
          hasActiveFilters={filtered}
          autoSubmit
        />
      </AutoFilterForm>
    </FilterPanel>
  );
}
