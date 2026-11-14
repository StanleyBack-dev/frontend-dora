import type { Metadata } from "next";
import { CalendarDays } from "lucide-react";
import {
  Card,
  EmptyState,
  FilterActions,
  FilterPanel,
  PageHeader,
  Pagination,
  Select,
} from "@/design-system";
import { AccessDenied } from "@/features/access/components/AccessDenied";
import { BookingsManageTable } from "@/features/bookings/components/BookingsManageTable";
import { BookingsTabs } from "@/features/bookings/components/BookingsTabs";
import {
  BOOKING_STATUS,
  BOOKING_STATUS_ORDER,
} from "@/features/bookings/model/booking-labels";
import { authed, getSessionUser } from "@/server/auth/current-user";
import { bookingsService } from "@/server/services/bookings.service";
import { spacesService } from "@/server/services/spaces.service";
import { requestTime } from "@/server/request-time";
import { can } from "@/shared/lib/access";
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

export default async function ManageBookingsPage({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>;
}) {
  const user = await getSessionUser();
  if (!can(user, "BOOKINGS_MANAGE")) return <AccessDenied />;

  const params = await searchParams;
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

  const [bookings, pending] = await authed((token) =>
    Promise.all([
      bookingsService.all(token, {
        spaceId,
        status,
        when: PERIODS[period],
        page,
        limit: PAGE_SIZE,
      }),
      bookingsService
        .all(token, { status: "PENDING", when: "UPCOMING", page: 1, limit: 1 })
        .then((result) => result.total),
    ]),
  );
  const hrefWith = (overrides: Record<string, string | number | undefined>) =>
    buildHref("/reservas/gestao", {
      espaco: spaceId,
      situacao: status,
      periodo: period === "proximas" ? undefined : period,
      ...overrides,
    });
  const filtered = Boolean(spaceId || status || period !== "proximas");
  const now = (await requestTime()).getTime();

  return (
    <>
      <PageHeader
        title="Reservas"
        description="Todas as reservas do condomínio: aprove, recuse ou cancele."
      />
      <BookingsTabs current="manage" manager pending={pending} />

      <FilterPanel hasActiveFilters={filtered}>
        <form className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Select
            label="Espaço"
            name="espaco"
            defaultValue={spaceId ?? ""}
            placeholder="Todos"
            options={spaces.map((space) => ({
              value: space.id,
              label: space.name,
            }))}
          />
          <Select
            label="Situação"
            name="situacao"
            defaultValue={status ?? ""}
            placeholder="Todas"
            options={BOOKING_STATUS_ORDER.map((value) => ({
              value,
              label: BOOKING_STATUS[value].label,
            }))}
          />
          <Select
            label="Período"
            name="periodo"
            defaultValue={period}
            options={[
              { value: "proximas", label: "Próximas" },
              { value: "passadas", label: "Passadas" },
            ]}
          />
          <FilterActions
            clearHref="/reservas/gestao"
            hasActiveFilters={filtered}
          />
        </form>
      </FilterPanel>

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
          hrefFor={(target) => hrefWith({ page: target })}
        />
      </Card>
    </>
  );
}
