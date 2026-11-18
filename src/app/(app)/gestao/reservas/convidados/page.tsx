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
import { BookingGuestsSummary } from "@/features/bookings/components/BookingGuestsSummary";
import { BookingGuestsTable } from "@/features/bookings/components/BookingGuestsTable";
import { BookingsCalendarNav } from "@/features/bookings/components/BookingsCalendarNav";
import { addDays } from "@/features/bookings/model/booking-calendar";
import { authed, getSessionUser } from "@/server/auth/current-user";
import { requestTime } from "@/server/request-time";
import { bookingsService } from "@/server/services/bookings.service";
import type { DayGuestFilter } from "@/shared/contracts/bookings";
import { can } from "@/shared/lib/access";
import { formatLongDay, isDay, localDay } from "@/shared/lib/datetime";
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

export const metadata: Metadata = { title: "Convidados" };

const BASE = "/gestao/reservas/convidados";
const ENTRIES = { entraram: true, faltam: false } as const;
const ids = (options: { id: string }[]) => options.map((option) => option.id);
const toOptions = (options: { id: string; label: string }[]) =>
  options.map((option) => ({ value: option.id, label: option.label }));

// The guests of a day's bookings (Gestão, Reservas, Convidados), for the
// managers to follow who comes: the day's numbers and a page of guests
// filtered by the API (guest, who invited, unit, space, entry). Read-only:
// the gate (Portaria) lets them in.
export default async function BookingGuestsPage({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>;
}) {
  const user = await getSessionUser();
  if (!can(user, "GUESTS_CHECKIN")) return <AccessDenied />;

  const query = await searchParams;
  const today = localDay(await requestTime());
  const asked = firstParam(query, "data");
  const day = isDay(asked) ? asked : today;
  const date = day === today ? undefined : day;

  // The numbers and what the filters offer, whatever the filters.
  const overview = await authed((token) =>
    bookingsService.dayGuestsOverview(token, date),
  );
  const guestId = oneOf(firstParam(query, "convidado"), ids(overview.guests));
  const hostId = oneOf(firstParam(query, "anfitriao"), ids(overview.hosts));
  const unitId = oneOf(firstParam(query, "unidade"), ids(overview.units));
  const spaceId = oneOf(firstParam(query, "espaco"), ids(overview.spaces));
  const entry = oneOf(
    firstParam(query, "entrada"),
    Object.keys(ENTRIES) as (keyof typeof ENTRIES)[],
  );
  const page = pageParam(query);
  const pageSize = pageSizeParam(query);

  const filter: DayGuestFilter = {
    ...(guestId && { guestId }),
    ...(hostId && { hostId }),
    ...(unitId && { unitId }),
    ...(spaceId && { spaceId }),
    ...(entry && { checkedIn: ENTRIES[entry] }),
  };
  const filtered = Object.keys(filter).length > 0;
  const guests = await authed((token) =>
    bookingsService.dayGuests(token, date, filter, { page, limit: pageSize }),
  );

  const hrefWith = (overrides: Record<string, string | number | undefined>) =>
    buildHref(BASE, {
      data: date,
      convidado: guestId,
      anfitriao: hostId,
      unidade: unitId,
      espaco: spaceId,
      entrada: entry,
      "por-pagina": pageSizeQuery(pageSize),
      ...overrides,
    });
  // Another day starts over: its guests and options are other ones.
  const dayHref = (target: string) =>
    buildHref(BASE, {
      data: target === today ? undefined : target,
      "por-pagina": pageSizeQuery(pageSize),
    });
  const clearHref = buildHref(BASE, { data: date });

  return (
    <>
      <PageHeader
        title="Convidados"
        description="Os convidados das reservas do dia: quem convidou e quem já entrou pela portaria."
      />

      <BookingsCalendarNav
        period={{
          label: day === today ? "Hoje" : formatLongDay(`${day}T12:00:00Z`),
          prevLabel: "Dia anterior",
          nextLabel: "Próximo dia",
          prevHref: dayHref(addDays(day, -1)),
          nextHref: dayHref(addDays(day, 1)),
          currentLabel: "Hoje",
          currentHref: day === today ? undefined : dayHref(today),
        }}
      />

      <BookingGuestsSummary overview={overview} />

      <FilterScope>
        <FilterPanel hasActiveFilters={filtered}>
          <AutoFilterForm className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {date && <input type="hidden" name="data" value={date} />}
            {pageSize !== DEFAULT_PAGE_SIZE && (
              <input type="hidden" name="por-pagina" value={pageSize} />
            )}
            <FilterCombobox
              label="Convidado"
              name="convidado"
              defaultValue={guestId ?? ""}
              placeholder="Todos"
              options={toOptions(overview.guests)}
            />
            <FilterCombobox
              label="Quem convidou"
              name="anfitriao"
              defaultValue={hostId ?? ""}
              placeholder="Todos"
              options={toOptions(overview.hosts)}
            />
            <FilterCombobox
              label="Unidade"
              name="unidade"
              defaultValue={unitId ?? ""}
              placeholder="Todas"
              options={toOptions(overview.units)}
            />
            <FilterCombobox
              label="Espaço"
              name="espaco"
              defaultValue={spaceId ?? ""}
              placeholder="Todos"
              options={toOptions(overview.spaces)}
            />
            <FilterCombobox
              label="Entrada"
              name="entrada"
              defaultValue={entry ?? ""}
              placeholder="Todos"
              options={[
                { value: "entraram", label: "Já entraram" },
                { value: "faltam", label: "Ainda não entraram" },
              ]}
            />
            <FilterActions
              clearHref={clearHref}
              hasActiveFilters={filtered}
              autoSubmit
            />
          </AutoFilterForm>
        </FilterPanel>

        <FilterResults>
          <Card>
            <BookingGuestsTable guests={guests.items} filtered={filtered} />
            <Pagination
              page={guests.page}
              totalPages={guests.totalPages}
              total={guests.total}
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
