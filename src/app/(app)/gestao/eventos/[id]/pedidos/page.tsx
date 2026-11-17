import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Card, PageHeader, SegmentedNav } from "@/design-system";
import { AccessDenied } from "@/features/access/components/AccessDenied";
import { EventOrdersReview } from "@/features/events/components/EventOrdersReview";
import { eventPeriod } from "@/features/events/model/event-labels";
import {
  ORDER_FILTER_KEYS,
  ORDER_FILTERS,
  ordersIn,
  type OrderFilter,
} from "@/features/events/model/order-filters";
import { getSessionUser } from "@/server/auth/current-user";
import { loadEvent } from "@/server/loaders/load-event";
import { loadEventOrders } from "@/server/loaders/load-event-orders";
import { can } from "@/shared/lib/access";
import { formatCents } from "@/shared/lib/format";
import {
  firstParam,
  oneOf,
  type RawSearchParams,
} from "@/shared/lib/search-params";

export const metadata: Metadata = { title: "Pedidos do evento" };

// An event's orders for whoever reviews payments: the receipts to check
// first, then the unpaid, the confirmed and the closed ones.
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
  const filter =
    oneOf(firstParam(await searchParams, "situacao"), ORDER_FILTER_KEYS) ??
    "conferir";

  const orders = await loadEventOrders(event.id, null);
  const of = (key: OrderFilter) => ordersIn(orders, key);
  const confirmed = of("confirmados");
  const received = confirmed.reduce((sum, order) => sum + order.totalCents, 0);
  const people = confirmed.reduce(
    (sum, order) => sum + order.attendees.length,
    0,
  );

  return (
    <>
      <Link
        href={`/gestao/eventos/${event.id}`}
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted hover:text-fg"
      >
        <ArrowLeft className="size-4" /> {event.title}
      </Link>
      <PageHeader
        title="Pedidos e comprovantes"
        description={`${event.title} · ${eventPeriod(event)}. Confirmados: ${people} ${people === 1 ? "pessoa" : "pessoas"}${event.ticketed ? `, ${formatCents(received)}` : ""}.`}
      />
      <SegmentedNav
        label="Situação"
        className="mb-4"
        items={ORDER_FILTER_KEYS.map((key) => ({
          label: ORDER_FILTERS[key].label,
          href:
            key === "conferir"
              ? `/gestao/eventos/${event.id}/pedidos`
              : `/gestao/eventos/${event.id}/pedidos?situacao=${key}`,
          active: filter === key,
          count: of(key).length,
        }))}
      />
      <Card>
        <EventOrdersReview orders={of(filter)} />
      </Card>
    </>
  );
}
