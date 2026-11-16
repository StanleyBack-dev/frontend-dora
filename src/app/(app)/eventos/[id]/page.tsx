import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarClock, MapPin, Ticket, Users } from "lucide-react";
import { Alert, Badge, Card, CardBody, PageHeader } from "@/design-system";
import { EventManageActions } from "@/features/events/components/EventManageActions";
import {
  EVENT_STATUS,
  eventLimits,
  eventPeriod,
  eventPlace,
  formatEventAddress,
  isEventOpen,
} from "@/features/events/model/event-labels";
import { getSessionUser } from "@/server/auth/current-user";
import { loadEvent } from "@/server/loaders/load-event";
import { requestTime } from "@/server/request-time";
import { can } from "@/shared/lib/access";

export const metadata: Metadata = { title: "Evento" };

// One event: when, where, limits and how to get in. Managers see the
// actions (edit, publish, cancel) while it is open.
export default async function EventPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getSessionUser();
  const event = await loadEvent((await params).id);
  if (!event) notFound();
  const manager = can(user, "EVENTS_MANAGE");
  const open = isEventOpen(event, (await requestTime()).getTime());
  const limits = eventLimits(event);
  const status = EVENT_STATUS[event.status];

  return (
    <>
      <Link
        href="/eventos"
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted hover:text-fg"
      >
        <ArrowLeft className="size-4" /> Eventos
      </Link>
      <PageHeader
        title={event.title}
        description={eventPeriod(event)}
        actions={
          manager && open ? <EventManageActions event={event} /> : undefined
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
                ? "Entrada com ingresso pago por Pix ao condomínio. A compra de ingressos chega em breve no app."
                : "Entrada gratuita com ingresso e QR code. A inscrição chega em breve no app."}
            </p>
          </CardBody>
        </Card>
      </div>
    </>
  );
}
