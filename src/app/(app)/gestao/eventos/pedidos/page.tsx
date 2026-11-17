import type { Metadata } from "next";
import {
  Card,
  FilterActions,
  FilterPanel,
  PageHeader,
  Select,
  SegmentedNav,
} from "@/design-system";
import { AccessDenied } from "@/features/access/components/AccessDenied";
import { EventOrdersReview } from "@/features/events/components/EventOrdersReview";
import {
  ORDER_FILTER_KEYS,
  ORDER_FILTERS,
  ordersIn,
  type OrderFilter,
} from "@/features/events/model/order-filters";
import { authed, getSessionUser } from "@/server/auth/current-user";
import { eventsService } from "@/server/services/events.service";
import { can } from "@/shared/lib/access";
import {
  buildHref,
  firstParam,
  oneOf,
  type RawSearchParams,
} from "@/shared/lib/search-params";

export const metadata: Metadata = { title: "Pedidos" };

/** The ids the API accepts (v4). */
const UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

// The orders of every event in one queue (Gestão, Eventos, Pedidos), for
// whoever reviews payments: the receipts to check first, oldest on top, and
// one event when picked.
export default async function OrdersQueuePage({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>;
}) {
  const user = await getSessionUser();
  if (!can(user, "PAYMENTS_MANAGE")) return <AccessDenied />;
  const params = await searchParams;
  const filter: OrderFilter =
    oneOf(firstParam(params, "situacao"), ORDER_FILTER_KEYS) ?? "conferir";
  const eventParam = firstParam(params, "evento") ?? "";
  const eventId = UUID.test(eventParam) ? eventParam : null;

  const [orders, upcoming, past] = await authed((token) =>
    Promise.all([
      eventsService.ordersQueue(token, eventId),
      eventsService.list(token, "UPCOMING"),
      eventsService.list(token, "PAST"),
    ]),
  );
  const events = [...upcoming, ...past].filter(
    (event) => event.status !== "DRAFT",
  );
  const hrefWith = (overrides: Record<string, string | undefined>) =>
    buildHref("/gestao/eventos/pedidos", {
      situacao: filter === "conferir" ? undefined : filter,
      evento: eventId ?? undefined,
      ...overrides,
    });
  const waiting = ordersIn(orders, "conferir").length;

  return (
    <>
      <PageHeader
        title="Pedidos"
        description={
          waiting > 0
            ? `${waiting} ${waiting === 1 ? "pedido espera" : "pedidos esperam"} a conferência do comprovante ou dos documentos, os mais antigos primeiro.`
            : "Os pedidos de ingressos de todos os eventos, os mais antigos primeiro."
        }
      />
      <FilterPanel hasActiveFilters={eventId !== null}>
        <form role="search" className="grid gap-3 sm:grid-cols-2">
          {filter !== "conferir" && (
            <input type="hidden" name="situacao" value={filter} />
          )}
          <Select
            label="Evento"
            name="evento"
            defaultValue={eventId ?? ""}
            options={[
              { value: "", label: "Todos os eventos" },
              ...events.map((event) => ({
                value: event.id,
                label: event.title,
              })),
            ]}
          />
          <FilterActions
            clearHref="/gestao/eventos/pedidos"
            hasActiveFilters={eventId !== null}
          />
        </form>
      </FilterPanel>
      <SegmentedNav
        label="Situação"
        className="mb-4"
        items={ORDER_FILTER_KEYS.map((key) => ({
          label: ORDER_FILTERS[key].label,
          href: hrefWith({ situacao: key === "conferir" ? undefined : key }),
          active: filter === key,
          count: ordersIn(orders, key).length,
        }))}
      />
      <Card>
        <EventOrdersReview orders={ordersIn(orders, filter)} showEvent />
      </Card>
    </>
  );
}
