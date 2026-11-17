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
  Card,
  Field,
  FilterActions,
  FilterPanel,
  PageHeader,
  Select,
  StatCard,
} from "@/design-system";
import { AccessDenied } from "@/features/access/components/AccessDenied";
import { EventOrdersReview } from "@/features/events/components/EventOrdersReview";
import { eventPeriod } from "@/features/events/model/event-labels";
import {
  ORDER_FILTER_KEYS,
  ORDER_FILTERS,
  ordersIn,
} from "@/features/events/model/order-filters";
import { getSessionUser } from "@/server/auth/current-user";
import { loadEvent } from "@/server/loaders/load-event";
import { loadEventOrders } from "@/server/loaders/load-event-orders";
import type { EventOrderFilter } from "@/shared/contracts/events";
import { can } from "@/shared/lib/access";
import { formatCents } from "@/shared/lib/format";
import {
  firstParam,
  oneOf,
  type RawSearchParams,
} from "@/shared/lib/search-params";

export const metadata: Metadata = { title: "Pedidos do evento" };

// An event's orders for whoever reviews payments: the numbers of the event
// and its orders, filtered by the API (who ordered, code, unit or a person;
// the status). Those waiting for review come first, open.
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

  const query = await searchParams;
  const search = firstParam(query, "busca")?.trim().slice(0, 80) ?? "";
  const status = oneOf(firstParam(query, "situacao"), ORDER_FILTER_KEYS);
  const filter: EventOrderFilter = {
    ...(search && { search }),
    ...(status && { statuses: [...ORDER_FILTERS[status].statuses] }),
  };
  const filtered = Object.keys(filter).length > 0;

  // Every order (the numbers) and, with filters, the ones that match.
  const all = await loadEventOrders(event.id);
  const orders = filtered ? await loadEventOrders(event.id, filter) : all;
  const toCheck = ordersIn(all, "conferir").length;
  const confirmed = ordersIn(all, "confirmados");
  const received = confirmed.reduce((sum, order) => sum + order.totalCents, 0);
  const people = confirmed.reduce(
    (sum, order) => sum + order.attendees.length,
    0,
  );

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
          value={String(ordersIn(all, "aguardando").length)}
          icon={<Clock />}
        />
        <StatCard
          label="Confirmados"
          value={String(confirmed.length)}
          icon={<CircleCheck />}
          tone="success"
        />
        {event.ticketed ? (
          <StatCard
            label="Recebido"
            value={formatCents(received)}
            icon={<Wallet />}
          />
        ) : (
          <StatCard
            label="Pessoas confirmadas"
            value={String(people)}
            icon={<Users />}
          />
        )}
      </div>

      <FilterPanel hasActiveFilters={filtered}>
        <form
          role="search"
          className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
        >
          <Field
            label="Buscar"
            name="busca"
            defaultValue={search}
            placeholder="Quem pediu, código, unidade ou pessoa"
          />
          <Select
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
            clearHref={`/gestao/eventos/${event.id}/pedidos`}
            hasActiveFilters={filtered}
          />
        </form>
      </FilterPanel>

      <Card>
        <EventOrdersReview orders={orders} filtered={filtered} />
      </Card>
    </>
  );
}
