import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import {
  Field,
  FilterActions,
  FilterPanel,
  PageHeader,
  Select,
} from "@/design-system";
import { AccessDenied } from "@/features/access/components/AccessDenied";
import { EventTicketsSummary } from "@/features/events/components/EventTicketsSummary";
import { EventTicketsTable } from "@/features/events/components/EventTicketsTable";
import { eventPeriod } from "@/features/events/model/event-labels";
import { authed, getSessionUser } from "@/server/auth/current-user";
import { loadEvent } from "@/server/loaders/load-event";
import { eventsService } from "@/server/services/events.service";
import type { EventTicketFilter } from "@/shared/contracts/events";
import { can } from "@/shared/lib/access";
import {
  firstParam,
  oneOf,
  type RawSearchParams,
} from "@/shared/lib/search-params";

export const metadata: Metadata = { title: "Ingressos e entradas" };

const ENTRIES = { entraram: true, faltam: false } as const;
const ORIGINS = { condominio: false, fora: true } as const;
const WHO = { pediram: true, acompanhantes: false } as const;
const keysOf = <K extends string>(map: Record<K, boolean>) =>
  Object.keys(map) as K[];

// An event's tickets and entries for its managers: the numbers of the
// event and the people of the confirmed orders, filtered by the API (name,
// unit or code, entry, ticket type, from outside, who ordered).
export default async function EventTicketsPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<RawSearchParams>;
}) {
  const user = await getSessionUser();
  if (!can(user, "EVENTS_MANAGE")) return <AccessDenied />;
  const event = await loadEvent((await params).id);
  if (!event) notFound();

  const query = await searchParams;
  const search = firstParam(query, "busca")?.trim().slice(0, 80) ?? "";
  const entry = oneOf(firstParam(query, "entrada"), keysOf(ENTRIES));
  const origin = oneOf(firstParam(query, "origem"), keysOf(ORIGINS));
  const who = oneOf(firstParam(query, "quem"), keysOf(WHO));

  // Every ticket: the numbers and the ticket types to pick from.
  const all = await authed((token) => eventsService.tickets(token, event.id));
  const types = [
    ...new Set(all.flatMap((ticket) => ticket.ticketName ?? [])),
  ].sort((a, b) => a.localeCompare(b, "pt-BR"));
  const ticketName = oneOf(firstParam(query, "ingresso"), types);

  const filter: EventTicketFilter = {
    ...(search && { search }),
    ...(entry && { checkedIn: ENTRIES[entry] }),
    ...(ticketName && { ticketName }),
    ...(origin && { outside: ORIGINS[origin] }),
    ...(who && { buyer: WHO[who] }),
  };
  const filtered = Object.keys(filter).length > 0;
  const tickets = filtered
    ? await authed((token) => eventsService.tickets(token, event.id, filter))
    : all;

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
        description={`Ingressos e entradas · ${eventPeriod(event)}. Quem tem ingresso e quem já entrou pela portaria.`}
      />
      <EventTicketsSummary tickets={all} />

      <FilterPanel hasActiveFilters={filtered}>
        <form
          role="search"
          className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
        >
          <Field
            label="Buscar"
            name="busca"
            defaultValue={search}
            placeholder="Nome, unidade ou código"
          />
          <Select
            label="Entrada"
            name="entrada"
            defaultValue={entry ?? ""}
            placeholder="Todos"
            options={[
              { value: "entraram", label: "Já entraram" },
              { value: "faltam", label: "Ainda não entraram" },
            ]}
          />
          {types.length > 1 && (
            <Select
              label="Ingresso"
              name="ingresso"
              defaultValue={ticketName ?? ""}
              placeholder="Todos"
              options={types.map((name) => ({ value: name, label: name }))}
            />
          )}
          <Select
            label="Quem"
            name="quem"
            defaultValue={who ?? ""}
            placeholder="Todos"
            options={[
              { value: "pediram", label: "Quem fez o pedido" },
              { value: "acompanhantes", label: "Acompanhantes" },
            ]}
          />
          <Select
            label="Origem"
            name="origem"
            defaultValue={origin ?? ""}
            placeholder="Todos"
            options={[
              { value: "condominio", label: "Do condomínio" },
              { value: "fora", label: "De fora" },
            ]}
          />
          <FilterActions
            clearHref={`/gestao/eventos/${event.id}/ingressos`}
            hasActiveFilters={filtered}
          />
        </form>
      </FilterPanel>

      <EventTicketsTable tickets={tickets} filtered={filtered} />
    </>
  );
}
