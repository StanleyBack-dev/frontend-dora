import type { Metadata } from "next";
import Link from "next/link";
import {
  Card,
  CardBody,
  FilterActions,
  FilterPanel,
  PageHeader,
  Select,
} from "@/design-system";
import { AccessDenied } from "@/features/access/components/AccessDenied";
import { EventTicketsBoard } from "@/features/events/components/EventTicketsBoard";
import { eventPeriod } from "@/features/events/model/event-labels";
import { authed, getSessionUser } from "@/server/auth/current-user";
import { eventsService } from "@/server/services/events.service";
import { can } from "@/shared/lib/access";
import { firstParam, type RawSearchParams } from "@/shared/lib/search-params";

export const metadata: Metadata = { title: "Ingressos" };

// The tickets of an event and who already came in through the gate (Eventos,
// Ingressos), for its managers: the next event first, any other one picked.
export default async function TicketsPage({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>;
}) {
  const user = await getSessionUser();
  if (!can(user, "EVENTS_MANAGE")) return <AccessDenied />;
  const picked = firstParam(await searchParams, "evento") ?? "";

  const [upcoming, past] = await authed((token) =>
    Promise.all([
      eventsService.list(token, "UPCOMING"),
      eventsService.list(token, "PAST"),
    ]),
  );
  // Only published events have tickets (a cancelled one keeps its list).
  const events = [...upcoming, ...past].filter(
    (event) => event.status !== "DRAFT",
  );
  const event = events.find((item) => item.id === picked) ?? events[0];
  const tickets = event
    ? await authed((token) => eventsService.tickets(token, event.id))
    : [];

  return (
    <>
      <PageHeader
        title="Ingressos"
        description={
          event
            ? `${event.title} · ${eventPeriod(event)}. Quem tem ingresso e quem já entrou pela portaria.`
            : "Quem tem ingresso de cada evento e quem já entrou pela portaria."
        }
      />
      {event ? (
        <>
          <FilterPanel hasActiveFilters={event.id === picked}>
            <form role="search" className="grid gap-3 sm:grid-cols-2">
              <Select
                label="Evento"
                name="evento"
                defaultValue={event.id}
                options={events.map((item) => ({
                  value: item.id,
                  label: item.title,
                }))}
              />
              <FilterActions
                clearHref="/gestao/eventos/ingressos"
                hasActiveFilters={event.id === picked}
              />
            </form>
          </FilterPanel>
          <EventTicketsBoard tickets={tickets} />
        </>
      ) : (
        <Card>
          <CardBody className="text-sm text-soft">
            Nenhum evento publicado ainda.{" "}
            <Link
              href="/gestao/eventos"
              className="font-medium text-brand hover:underline"
            >
              Ver os eventos
            </Link>
          </CardBody>
        </Card>
      )}
    </>
  );
}
