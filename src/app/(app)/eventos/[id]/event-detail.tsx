import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  CalendarClock,
  MapPin,
  ReceiptText,
  Settings2,
  Ticket,
  Users,
} from "lucide-react";
import {
  Alert,
  Badge,
  Card,
  CardBody,
  PageHeader,
  buttonClasses,
} from "@/design-system";
import { EventManageActions } from "@/features/events/components/EventManageActions";
import { EventOrderButton } from "@/features/events/components/EventOrderButton";
import { EventTicketsCard } from "@/features/events/components/EventTicketsCard";
import { MyEventOrders } from "@/features/events/components/MyEventOrders";
import {
  EVENT_STATUS,
  eventLimits,
  eventPeriod,
  eventPlace,
  formatEventAddress,
  isEventOpen,
} from "@/features/events/model/event-labels";
import { getSessionUser } from "@/server/auth/current-user";
import { heldPeople } from "@/features/events/model/held-people";
import { loadEvent } from "@/server/loaders/load-event";
import { loadMyEventOrders } from "@/server/loaders/load-event-orders";
import { loadApprovedDependents } from "@/server/loaders/load-dependents";
import { requestTime } from "@/server/request-time";
import { can } from "@/shared/lib/access";
import { formatDateTime } from "@/shared/lib/format";

/** Where the event is open: the resident's app or the management area. */
export type EventArea = "app" | "manage";

// One event, shared by the resident's page (/eventos/<id>) and the
// management's (/gestao/eventos/<id>): when, where, limits and how to get
// in. In the app: the order button while it takes orders and the person's
// own orders (PIX, receipt, tickets). In the management: the actions (edit,
// publish, cancel) while it is open and, for whoever reviews payments, the
// orders.
export async function EventDetail({
  id,
  area,
}: {
  id: string;
  area: EventArea;
}) {
  const user = await getSessionUser();
  const event = await loadEvent(id);
  if (!event) notFound();
  const managing = area === "manage";
  const manager = can(user, "EVENTS_MANAGE");
  const reviewer = can(user, "PAYMENTS_MANAGE");
  const now = (await requestTime()).getTime();
  const open = isEventOpen(event, now);
  const published = event.status === "PUBLISHED";
  // Orders until the event's sales close (some hours before the start, or
  // its end), as the API checks.
  const onSale = published && new Date(event.salesClosesAt).getTime() > now;
  const [myOrders, dependents] =
    published && !managing
      ? await Promise.all([
          loadMyEventOrders(event.id),
          onSale ? loadApprovedDependents() : Promise.resolve([]),
        ])
      : [[], []];
  // One ticket per person: who already has one is not offered again.
  const held = heldPeople(myOrders, now);
  const limits = eventLimits(event);
  const status = EVENT_STATUS[event.status];

  return (
    <>
      <Link
        href={managing ? "/gestao/eventos" : "/eventos"}
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted hover:text-fg"
      >
        <ArrowLeft className="size-4" /> Eventos
      </Link>
      <PageHeader
        title={event.title}
        description={eventPeriod(event)}
        actions={
          managing && ((manager && open) || (reviewer && published)) ? (
            <div className="flex flex-wrap gap-2">
              {reviewer && published && (
                <Link
                  href={`/gestao/eventos/${event.id}/pedidos`}
                  className={buttonClasses("secondary")}
                >
                  <ReceiptText aria-hidden className="size-4" />
                  Pedidos
                </Link>
              )}
              {manager && open && <EventManageActions event={event} />}
            </div>
          ) : !managing && (manager || reviewer) ? (
            <Link
              href={`/gestao/eventos/${event.id}`}
              className={buttonClasses("secondary")}
            >
              <Settings2 aria-hidden className="size-4" />
              Gerenciar
            </Link>
          ) : undefined
        }
      />

      {event.status === "CANCELLED" && (
        <Alert tone="danger" className="mb-4">
          Evento cancelado{event.cancelReason ? `: ${event.cancelReason}` : "."}
        </Alert>
      )}
      {event.status === "DRAFT" && (
        <Alert tone="info" className="mb-4">
          Rascunho: só a administração vê. Publique para os moradores verem e
          serem avisados.
        </Alert>
      )}

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="min-w-0 space-y-4">
          <Card>
            <CardBody className="space-y-3">
              {event.description ? (
                <p className="text-[15px] whitespace-pre-line text-fg">
                  {event.description}
                </p>
              ) : (
                <p className="text-sm text-soft">Sem descrição.</p>
              )}
            </CardBody>
          </Card>
          {event.status !== "CANCELLED" && (
            <EventTicketsCard
              event={event}
              onSale={onSale}
              action={
                managing ? undefined : onSale ? (
                  <EventOrderButton
                    event={event}
                    viewer={{
                      name: user.name,
                      birthDate: user.birthDate,
                      held: held.self,
                    }}
                    dependents={dependents
                      .filter(({ id }) => !held.dependentIds.has(id))
                      .map(({ id, name, birthDate }) => ({
                        id,
                        name,
                        birthDate,
                      }))}
                    heldNames={held.names}
                  />
                ) : published ? (
                  <p className="text-xs text-soft">
                    {event.ticketed ? "As vendas" : "As inscrições"} fecharam em{" "}
                    {formatDateTime(event.salesClosesAt)}.
                  </p>
                ) : (
                  <p className="text-xs text-soft">
                    Os pedidos abrem quando o evento for publicado.
                  </p>
                )
              }
            />
          )}
          {!managing && <MyEventOrders orders={myOrders} />}
        </div>
        <Card className="self-start">
          <CardBody className="space-y-3 text-sm">
            <div className="flex flex-wrap gap-2">
              {manager && <Badge tone={status.tone}>{status.label}</Badge>}
              <Badge tone={event.ticketed ? "brand" : "info"}>
                <Ticket aria-hidden className="size-3" />
                {event.ticketed ? "Ingresso pago" : "Gratuito"}
              </Badge>
            </div>
            <p className="flex items-start gap-2 text-fg">
              <CalendarClock
                aria-hidden
                className="mt-0.5 size-4 shrink-0 text-soft"
              />
              {eventPeriod(event)}
            </p>
            <p className="flex items-start gap-2 text-fg">
              <MapPin
                aria-hidden
                className="mt-0.5 size-4 shrink-0 text-soft"
              />
              <span>
                {eventPlace(event)}
                {event.address && (
                  <>
                    <span className="mt-0.5 block text-xs text-muted">
                      {formatEventAddress(event.address)}
                    </span>
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(formatEventAddress(event.address))}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 inline-block text-xs font-medium text-brand-ink hover:underline"
                    >
                      Abrir no mapa
                    </a>
                  </>
                )}
              </span>
            </p>
            <p className="flex items-start gap-2 text-fg">
              <Users aria-hidden className="mt-0.5 size-4 shrink-0 text-soft" />
              {limits}
            </p>
            <p className="border-t border-border pt-3 text-xs text-muted">
              {event.ticketed
                ? "Entrada com ingresso pago por PIX. Os pedidos ficam reservados por 48 horas até o envio do comprovante."
                : "Entrada gratuita com inscrição: informe quem vai para garantir as vagas."}
            </p>
          </CardBody>
        </Card>
      </div>
    </>
  );
}
