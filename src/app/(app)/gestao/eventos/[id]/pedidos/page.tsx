import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  CircleCheck,
  Clock,
  FileSearch,
  Users,
  Wallet,
} from "lucide-react";
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
  StatCard,
} from "@/design-system";
import { AccessDenied } from "@/features/access/components/AccessDenied";
import { EventOrdersReview } from "@/features/events/components/EventOrdersReview";
import { eventPeriod } from "@/features/events/model/event-labels";
import {
  ORDER_FILTER_KEYS,
  ORDER_FILTERS,
  type OrderFilter,
} from "@/features/events/model/order-filters";
import { getSessionUser } from "@/server/auth/current-user";
import { loadEvent } from "@/server/loaders/load-event";
import {
  loadEventOrderOverview,
  loadEventOrders,
} from "@/server/loaders/load-event-orders";
import type {
  EventOrderFilter,
  EventOrderStatus,
} from "@/shared/contracts/events";
import { can } from "@/shared/lib/access";
import { formatCents } from "@/shared/lib/format";
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

export const metadata: Metadata = { title: "Pedidos do evento" };

// An event's orders for whoever reviews payments: the numbers of the event
// and a page of its orders, filtered by the API. Every filter is a list to
// pick from (who ordered, unit, code, status). Those waiting for review
// come first, open.
export default async function EventOrdersPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<RawSearchParams>;
}) {
  const user = await getSessionUser();
  if (!can(user, "PAYMENTS_MANAGE")) return <AccessDenied />;
  const event = await loadEvent((await params).id);
  if (!event) notFound();
  const base = `/gestao/eventos/${event.id}/pedidos`;

  // The numbers and what the filters offer, whatever the filters.
  const overview = await loadEventOrderOverview(event.id);
  const query = await searchParams;
  const buyer = oneOf(
    firstParam(query, "quem"),
    overview.buyers.map((item) => item.id),
  );
  const unit = oneOf(
    firstParam(query, "unidade"),
    overview.units.map((item) => item.id),
  );
  const code = oneOf(
    firstParam(query, "codigo"),
    overview.codes.map((item) => item.code),
  );
  const status = oneOf(firstParam(query, "situacao"), ORDER_FILTER_KEYS);
  const page = pageParam(query);
  const pageSize = pageSizeParam(query);

  const filter: EventOrderFilter = {
    ...(buyer && { buyerId: buyer }),
    ...(unit && { unitId: unit }),
    ...(code && { code }),
    ...(status && { statuses: [...ORDER_FILTERS[status].statuses] }),
  };
  const filtered = Object.keys(filter).length > 0;
  const orders = await loadEventOrders(event.id, filter, {
    page,
    limit: pageSize,
  });
  const hrefWith = (overrides: Record<string, string | number | undefined>) =>
    buildHref(base, {
      quem: buyer,
      unidade: unit,
      codigo: code,
      situacao: status,
      "por-pagina": pageSizeQuery(pageSize),
      ...overrides,
    });

  // How many orders of each tab, from the API's counts.
  const countOf = (key: OrderFilter) =>
    overview.byStatus
      .filter((item) =>
        (ORDER_FILTERS[key].statuses as readonly EventOrderStatus[]).includes(
          item.status,
        ),
      )
      .reduce((sum, item) => sum + item.count, 0);
  const toCheck = countOf("conferir");

  return (
    <>
      <Link
        href="/gestao/eventos"
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted hover:text-fg"
      >
        <ArrowLeft className="size-4" /> Eventos
      </Link>
      <PageHeader
        title={event.title}
        description={`Pedidos e comprovantes · ${eventPeriod(event)}.`}
      />
      {/* The numbers of the orders, as on the tickets page. */}
      <div className="mb-5 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatCard
          label="Para conferir"
          value={String(toCheck)}
          icon={<FileSearch />}
          tone={toCheck > 0 ? "warning" : "neutral"}
        />
        <StatCard
          label="Aguardando envio"
          value={String(countOf("aguardando"))}
          icon={<Clock />}
        />
        <StatCard
          label="Confirmados"
          value={String(countOf("confirmados"))}
          icon={<CircleCheck />}
          tone="success"
        />
        {event.ticketed ? (
          <StatCard
            label="Recebido"
            value={formatCents(overview.receivedCents)}
            icon={<Wallet />}
          />
        ) : (
          <StatCard
            label="Pessoas confirmadas"
            value={String(overview.confirmedPeople)}
            icon={<Users />}
          />
        )}
      </div>

      <FilterScope>
        <FilterPanel hasActiveFilters={filtered}>
          <AutoFilterForm className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {pageSize !== DEFAULT_PAGE_SIZE && (
              <input type="hidden" name="por-pagina" value={pageSize} />
            )}
            <FilterCombobox
              label="Quem pediu"
              name="quem"
              defaultValue={buyer ?? ""}
              placeholder="Todos"
              options={overview.buyers.map((item) => ({
                value: item.id,
                label: item.name,
              }))}
            />
            <FilterCombobox
              label="Unidade"
              name="unidade"
              defaultValue={unit ?? ""}
              placeholder="Todas"
              options={overview.units.map((item) => ({
                value: item.id,
                label: item.label,
              }))}
            />
            <FilterCombobox
              label="Código do pedido"
              name="codigo"
              defaultValue={code ?? ""}
              placeholder="Todos"
              options={overview.codes.map((item) => ({
                value: item.code,
                label: item.buyerName
                  ? `${item.code} · ${item.buyerName}`
                  : item.code,
              }))}
            />
            <FilterCombobox
              label="Situação"
              name="situacao"
              defaultValue={status ?? ""}
              placeholder="Todas"
              options={ORDER_FILTER_KEYS.map((key) => ({
                value: key,
                label: ORDER_FILTERS[key].label,
              }))}
            />
            <FilterActions
              clearHref={base}
              hasActiveFilters={filtered}
              autoSubmit
            />
          </AutoFilterForm>
        </FilterPanel>

        <FilterResults>
          <Card>
            <EventOrdersReview orders={orders.items} filtered={filtered} />
            <Pagination
              page={orders.page}
              totalPages={orders.totalPages}
              total={orders.total}
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
