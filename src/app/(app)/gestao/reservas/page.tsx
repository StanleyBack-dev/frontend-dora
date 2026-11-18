import type { Metadata } from "next";
import { CalendarDays } from "lucide-react";
import {
  AutoFilterForm,
  Card,
  EmptyState,
  FilterActions,
  FilterCombobox,
  FilterPanel,
  FilterResults,
  FilterScope,
  PageHeader,
  Pagination,
} from "@/design-system";
import { AccessDenied } from "@/features/access/components/AccessDenied";
import { BookingsCalendar } from "@/features/bookings/components/BookingsCalendar";
import { BookingsCalendarNav } from "@/features/bookings/components/BookingsCalendarNav";
import { BookingsManageTable } from "@/features/bookings/components/BookingsManageTable";
import {
  CALENDAR_VIEWS,
  calendarRange,
  formatWeekRange,
  hourRows,
  monthWeeks,
  shiftAnchor,
  weekDays,
  weekStart,
  type CalendarView,
} from "@/features/bookings/model/booking-calendar";
import {
  BOOKING_STATUS,
  BOOKING_STATUS_ORDER,
} from "@/features/bookings/model/booking-labels";
import { authed, getSessionUser } from "@/server/auth/current-user";
import { bookingsService } from "@/server/services/bookings.service";
import { spacesService } from "@/server/services/spaces.service";
import { requestTime } from "@/server/request-time";
import { can } from "@/shared/lib/access";
import { formatMonth, isDay, localDay } from "@/shared/lib/datetime";
import {
  buildHref,
  firstParam,
  oneOf,
  pageParam,
  type RawSearchParams,
} from "@/shared/lib/search-params";

export const metadata: Metadata = { title: "Gestão de reservas" };

const PAGE_SIZE = 20;
const PERIODS = { proximas: "UPCOMING", passadas: "PAST" } as const;
const VIEW_LABELS: Record<CalendarView, string> = {
  semana: "Semana",
  mes: "Mês",
  lista: "Lista",
};

// Every booking of the condominium for managers: a week (the hours down the
// side, the days across), a month, or the paged list. Filters (space,
// status) apply to all three; the period (upcoming/past) only to the list.
export default async function ManageBookingsPage({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>;
}) {
  const user = await getSessionUser();
  if (!can(user, "BOOKINGS_MANAGE")) return <AccessDenied />;

  const params = await searchParams;
  const nowDate = await requestTime();
  const now = nowDate.getTime();
  const today = localDay(nowDate);
  const view = oneOf(firstParam(params, "visao"), CALENDAR_VIEWS) ?? "semana";
  const dateParam = firstParam(params, "data");
  const anchor = isDay(dateParam) ? dateParam : today;

  const spaces = await authed((token) => spacesService.list(token, true));
  const spaceId = oneOf(
    firstParam(params, "espaco"),
    spaces.map((space) => space.id),
  );
  const status = oneOf(firstParam(params, "situacao"), BOOKING_STATUS_ORDER);
  const period =
    oneOf(firstParam(params, "periodo"), ["proximas", "passadas"] as const) ??
    "proximas";
  const page = pageParam(params);

  const hrefWith = (overrides: Record<string, string | number | undefined>) =>
    buildHref("/gestao/reservas", {
      visao: view === "semana" ? undefined : view,
      data: view === "lista" || anchor === today ? undefined : anchor,
      espaco: spaceId,
      situacao: status,
      periodo: view === "lista" && period !== "proximas" ? period : undefined,
      ...overrides,
    });
  const viewHref = (target: CalendarView) =>
    hrefWith({
      visao: target === "semana" ? undefined : target,
      data: target === "lista" || anchor === today ? undefined : anchor,
      periodo: undefined,
      page: undefined,
    });
  const filtered = Boolean(
    spaceId || status || (view === "lista" && period !== "proximas"),
  );

  const pending = await authed((token) =>
    bookingsService
      .all(token, { status: "PENDING", when: "UPCOMING", page: 1, limit: 1 })
      .then((result) => result.total),
  );

  return (
    <>
      <PageHeader
        title="Reservas"
        description={
          pending > 0
            ? `Todas as reservas do condomínio: ${pending} ${pending === 1 ? "aguarda" : "aguardam"} aprovação. Aprove, recuse ou cancele.`
            : "Todas as reservas do condomínio: aprove, recuse ou cancele."
        }
      />

      <FilterScope>
        <FilterPanel hasActiveFilters={filtered}>
          <AutoFilterForm className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <input type="hidden" name="visao" value={view} />
            {view !== "lista" && (
              <input type="hidden" name="data" value={anchor} />
            )}
            <FilterCombobox
              label="Espaço"
              name="espaco"
              defaultValue={spaceId ?? ""}
              placeholder="Todos"
              options={spaces.map((space) => ({
                value: space.id,
                label: space.name,
              }))}
            />
            <FilterCombobox
              label="Situação"
              name="situacao"
              defaultValue={status ?? ""}
              placeholder="Todas"
              options={BOOKING_STATUS_ORDER.map((value) => ({
                value,
                label: BOOKING_STATUS[value].label,
              }))}
            />
            {view === "lista" && (
              <FilterCombobox
                label="Período"
                name="periodo"
                defaultValue={period}
                placeholder="Próximas"
                options={[
                  { value: "proximas", label: "Próximas" },
                  { value: "passadas", label: "Passadas" },
                ]}
              />
            )}
            <FilterActions
              clearHref={
                view === "semana"
                  ? "/gestao/reservas"
                  : `/gestao/reservas?visao=${view}`
              }
              hasActiveFilters={filtered}
              autoSubmit
            />
          </AutoFilterForm>
        </FilterPanel>
        <FilterResults>
          {view === "lista" ? (
            <ListSection
              spaceId={spaceId}
              status={status}
              when={PERIODS[period]}
              page={page}
              now={now}
              filtered={filtered}
              nav={CALENDAR_VIEWS.map((target) => ({
                label: VIEW_LABELS[target],
                href: viewHref(target),
                active: target === view,
              }))}
              hrefFor={(target) => hrefWith({ page: target })}
            />
          ) : (
            <CalendarSection
              view={view}
              anchor={anchor}
              today={today}
              now={now}
              spaceId={spaceId}
              status={status}
              spaces={spaces}
              nav={CALENDAR_VIEWS.map((target) => ({
                label: VIEW_LABELS[target],
                href: viewHref(target),
                active: target === view,
              }))}
              dayHref={(day) =>
                hrefWith({
                  visao: undefined,
                  data: day === today ? undefined : day,
                })
              }
              shiftHref={(day) =>
                hrefWith({ data: day === today ? undefined : day })
              }
            />
          )}
        </FilterResults>
      </FilterScope>
    </>
  );
}

type Nav = { label: string; href: string; active: boolean }[];

async function ListSection({
  spaceId,
  status,
  when,
  page,
  now,
  filtered,
  nav,
  hrefFor,
}: {
  spaceId?: string;
  status?: (typeof BOOKING_STATUS_ORDER)[number];
  when: "UPCOMING" | "PAST";
  page: number;
  now: number;
  filtered: boolean;
  nav: Nav;
  hrefFor: (page: number) => string;
}) {
  const bookings = await authed((token) =>
    bookingsService.all(token, {
      spaceId,
      status,
      when,
      page,
      limit: PAGE_SIZE,
    }),
  );
  return (
    <>
      <BookingsCalendarNav views={nav} />
      <Card>
        {bookings.items.length === 0 ? (
          <EmptyState
            icon={<CalendarDays className="size-5" />}
            title="Nenhuma reserva encontrada"
            description={
              filtered
                ? "Tente outros filtros."
                : "As reservas dos moradores aparecem aqui."
            }
          />
        ) : (
          <BookingsManageTable bookings={bookings.items} now={now} />
        )}
        <Pagination
          page={bookings.page}
          totalPages={bookings.totalPages}
          total={bookings.total}
          pageSize={PAGE_SIZE}
          hrefFor={hrefFor}
        />
      </Card>
    </>
  );
}

async function CalendarSection({
  view,
  anchor,
  today,
  now,
  spaceId,
  status,
  spaces,
  nav,
  dayHref,
  shiftHref,
}: {
  view: "semana" | "mes";
  anchor: string;
  today: string;
  now: number;
  spaceId?: string;
  status?: (typeof BOOKING_STATUS_ORDER)[number];
  spaces: Awaited<ReturnType<typeof spacesService.list>>;
  nav: Nav;
  /** The week view of a day. */
  dayHref: (day: string) => string;
  /** The same view moved to another day. */
  shiftHref: (day: string) => string;
}) {
  const bookings = await authed((token) =>
    bookingsService.inRange(token, {
      ...calendarRange(view, anchor),
      spaceId,
      status,
    }),
  );
  const days = weekDays(anchor);
  const weeks = monthWeeks(anchor);
  const shown = spaceId
    ? spaces.filter((space) => space.id === spaceId)
    : spaces.filter((space) => space.active);

  return (
    <>
      <BookingsCalendarNav
        views={nav}
        period={{
          label:
            view === "semana"
              ? formatWeekRange(days)
              : formatMonth(anchor.slice(0, 7)),
          prevLabel: view === "semana" ? "Semana anterior" : "Mês anterior",
          nextLabel: view === "semana" ? "Próxima semana" : "Próximo mês",
          prevHref: shiftHref(shiftAnchor(view, anchor, -1)),
          nextHref: shiftHref(shiftAnchor(view, anchor, 1)),
          currentLabel: view === "semana" ? "Esta semana" : "Este mês",
          currentHref: (
            view === "semana"
              ? weekStart(anchor) === weekStart(today)
              : anchor.slice(0, 7) === today.slice(0, 7)
          )
            ? undefined
            : shiftHref(today),
        }}
      />
      <Card className="overflow-hidden p-0">
        {view === "semana" ? (
          <BookingsCalendar
            view="semana"
            days={days}
            hours={hourRows(shown, bookings)}
            bookings={bookings}
            today={today}
            now={now}
            showSpace={!spaceId}
          />
        ) : (
          <BookingsCalendar
            view="mes"
            weeks={weeks}
            month={anchor.slice(0, 7)}
            weekHref={Object.fromEntries(
              weeks.flat().map((day) => [day, dayHref(day)]),
            )}
            bookings={bookings}
            today={today}
            now={now}
            showSpace={!spaceId}
          />
        )}
      </Card>
    </>
  );
}
