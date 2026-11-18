import type { Metadata } from "next";
import {
  AutoFilterForm,
  Card,
  FilterActions,
  FilterCombobox,
  FilterPanel,
  FilterResults,
  FilterScope,
  PageHeader,
  Pagination,
} from "@/design-system";
import { AccessDenied } from "@/features/access/components/AccessDenied";
import { BookingsCalendarNav } from "@/features/bookings/components/BookingsCalendarNav";
import { FeesSummary } from "@/features/bookings/components/FeesSummary";
import { FeesTable } from "@/features/bookings/components/FeesTable";
import {
  FEE_SITUATIONS,
  toFeeFilter,
  type FeeFilterParams,
  type FeeSituation,
} from "@/features/bookings/model/fee-filter-params";
import { authed, getSessionUser } from "@/server/auth/current-user";
import { requestTime } from "@/server/request-time";
import { bookingsService } from "@/server/services/bookings.service";
import { can } from "@/shared/lib/access";
import {
  currentMonth,
  formatMonth,
  isMonth,
  shiftMonth,
} from "@/shared/lib/datetime";
import {
  buildHref,
  DEFAULT_PAGE_SIZE,
  firstParam,
  oneOf,
  PAGE_SIZES,
  pageParam,
  pageSizeParam,
  pageSizeQuery,
  type RawSearchParams,
} from "@/shared/lib/search-params";

export const metadata: Metadata = { title: "Taxas de uso" };

const BASE = "/gestao/reservas/taxas";
const ids = (options: { id: string }[]) => options.map((option) => option.id);
const toOptions = (options: { id: string; label: string }[]) =>
  options.map((option) => ({ value: option.id, label: option.label }));

// Usage fees of a month for the condominium's billing: the month's numbers
// and a page of fees filtered by the API (unit, space, who booked,
// situation), to mark as sent to billing and export as a spreadsheet.
export default async function BookingFeesPage({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>;
}) {
  const user = await getSessionUser();
  if (!can(user, "BOOKINGS_MANAGE")) return <AccessDenied />;

  const query = await searchParams;
  const thisMonth = currentMonth(await requestTime());
  const asked = firstParam(query, "mes");
  const month = isMonth(asked) ? asked : thisMonth;
  const mes = month === thisMonth ? undefined : month;

  // The numbers and what the filters offer, whatever the filters.
  const overview = await authed((token) =>
    bookingsService.feesOverview(token, mes),
  );
  const params: FeeFilterParams = {
    unidade: oneOf(firstParam(query, "unidade"), ids(overview.units)),
    espaco: oneOf(firstParam(query, "espaco"), ids(overview.spaces)),
    morador: oneOf(firstParam(query, "morador"), ids(overview.users)),
    situacao: oneOf(
      firstParam(query, "situacao"),
      Object.keys(FEE_SITUATIONS) as FeeSituation[],
    ),
  };
  const page = pageParam(query);
  const pageSize = pageSizeParam(query);
  const filter = toFeeFilter(params);
  const filtered = Object.keys(filter).length > 0;
  const fees = await authed((token) =>
    bookingsService.feesPage(token, mes, filter, { page, limit: pageSize }),
  );

  const hrefWith = (overrides: Record<string, string | number | undefined>) =>
    buildHref(BASE, {
      mes,
      ...params,
      "por-pagina": pageSizeQuery(pageSize),
      ...overrides,
    });
  // Another month starts over: its fees and options are other ones.
  const monthHref = (target: string) =>
    buildHref(BASE, {
      mes: target === thisMonth ? undefined : target,
      "por-pagina": pageSizeQuery(pageSize),
    });

  return (
    <>
      <PageHeader
        title="Taxas de uso"
        description="Reservas confirmadas de espaços pagos, por unidade, para lançar na cobrança do condomínio."
      />

      <BookingsCalendarNav
        period={{
          label: formatMonth(month),
          prevLabel: "Mês anterior",
          nextLabel: "Próximo mês",
          prevHref: monthHref(shiftMonth(month, -1)),
          nextHref: monthHref(shiftMonth(month, 1)),
          currentLabel: "Este mês",
          currentHref: month === thisMonth ? undefined : monthHref(thisMonth),
        }}
      />

      <FeesSummary overview={overview} />

      <FilterScope>
        <FilterPanel hasActiveFilters={filtered}>
          <AutoFilterForm className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {mes && <input type="hidden" name="mes" value={mes} />}
            {pageSize !== DEFAULT_PAGE_SIZE && (
              <input type="hidden" name="por-pagina" value={pageSize} />
            )}
            <FilterCombobox
              label="Unidade"
              name="unidade"
              defaultValue={params.unidade ?? ""}
              placeholder="Todas"
              options={toOptions(overview.units)}
            />
            <FilterCombobox
              label="Espaço"
              name="espaco"
              defaultValue={params.espaco ?? ""}
              placeholder="Todos"
              options={toOptions(overview.spaces)}
            />
            <FilterCombobox
              label="Morador"
              name="morador"
              defaultValue={params.morador ?? ""}
              placeholder="Todos"
              options={toOptions(overview.users)}
            />
            <FilterCombobox
              label="Situação"
              name="situacao"
              defaultValue={params.situacao ?? ""}
              placeholder="Todas"
              options={[
                { value: "pendentes", label: "Pendentes" },
                { value: "lancadas", label: "Lançadas na cobrança" },
              ]}
            />
            <FilterActions
              clearHref={buildHref(BASE, { mes })}
              hasActiveFilters={filtered}
              autoSubmit
            />
          </AutoFilterForm>
        </FilterPanel>

        <FilterResults>
          <Card>
            <FeesTable
              // A new page or filter starts with nothing selected.
              key={hrefWith({ page })}
              fees={fees.items}
              filtered={filtered}
              exportHref={buildHref("/api/bookings/fees/export", {
                mes: month,
                ...params,
              })}
            />
            <Pagination
              page={fees.page}
              totalPages={fees.totalPages}
              total={fees.total}
              pageSize={pageSize}
              hrefFor={(target) => hrefWith({ page: target })}
              pageSizes={PAGE_SIZES}
              pageSizeHref={(size) => hrefWith({ "por-pagina": size, page: 1 })}
            />
          </Card>
        </FilterResults>
      </FilterScope>
    </>
  );
}
