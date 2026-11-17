import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
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

export const metadata: Metadata = { title: "Ingressos e entradas" };

const ENTRIES = { entraram: true, faltam: false } as const;
const ORIGINS = { condominio: false, fora: true } as const;
const WHO = { pediram: true, acompanhantes: false } as const;
const keysOf = <K extends string>(map: Record<K, boolean>) =>
  Object.keys(map) as K[];

// An event's tickets and entries for its managers: the numbers of the
// event and a page of the people of the confirmed orders, filtered by the
// API. Every filter is a list to pick from (person, unit, code, entry,
// ticket type, who ordered, origin).
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
  const base = `/gestao/eventos/${event.id}/ingressos`;

  // The numbers and what the filters offer, whatever the filters.
  const overview = await authed((token) =>
    eventsService.ticketOverview(token, event.id),
  );
  const query = await searchParams;
  const person = oneOf(
    firstParam(query, "pessoa"),
    overview.people.map((item) => item.id),
  );
  const unit = oneOf(
    firstParam(query, "unidade"),
    overview.units.map((item) => item.id),
  );
  const code = oneOf(
    firstParam(query, "codigo"),
    overview.people.map((item) => item.ticketCode),
  );
  const types = overview.byType.flatMap((item) => item.name ?? []);
  const ticketName = oneOf(firstParam(query, "ingresso"), types);
  const entry = oneOf(firstParam(query, "entrada"), keysOf(ENTRIES));
  const origin = oneOf(firstParam(query, "origem"), keysOf(ORIGINS));
  const who = oneOf(firstParam(query, "quem"), keysOf(WHO));
  const page = pageParam(query);
  const pageSize = pageSizeParam(query);

  const filter: EventTicketFilter = {
    ...(person && { attendeeId: person }),
    ...(unit && { unitId: unit }),
    ...(code && { code }),
    ...(entry && { checkedIn: ENTRIES[entry] }),
    ...(ticketName && { ticketName }),
    ...(origin && { outside: ORIGINS[origin] }),
    ...(who && { buyer: WHO[who] }),
  };
  const filtered = Object.keys(filter).length > 0;
  const tickets = await authed((token) =>
    eventsService.tickets(token, event.id, filter, {
      page,
      limit: pageSize,
    }),
  );
  const hrefWith = (overrides: Record<string, string | number | undefined>) =>
    buildHref(base, {
      pessoa: person,
      unidade: unit,
      codigo: code,
      ingresso: ticketName,
      entrada: entry,
      origem: origin,
      quem: who,
      "por-pagina": pageSizeQuery(pageSize),
      ...overrides,
    });

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
      <EventTicketsSummary overview={overview} />

      <FilterScope>
        <FilterPanel hasActiveFilters={filtered}>
          <AutoFilterForm className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {pageSize !== DEFAULT_PAGE_SIZE && (
              <input type="hidden" name="por-pagina" value={pageSize} />
            )}
            <FilterCombobox
              label="Pessoa"
              name="pessoa"
              defaultValue={person ?? ""}
              placeholder="Todas"
              options={overview.people.map((item) => ({
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
              label="Código do ingresso"
              name="codigo"
              defaultValue={code ?? ""}
              placeholder="Todos"
              options={overview.people.map((item) => ({
                value: item.ticketCode,
                label: `${item.ticketCode} · ${item.name}`,
              }))}
            />
            <FilterCombobox
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
              <FilterCombobox
                label="Ingresso"
                name="ingresso"
                defaultValue={ticketName ?? ""}
                placeholder="Todos"
                options={types.map((name) => ({ value: name, label: name }))}
              />
            )}
            <FilterCombobox
              label="Quem"
              name="quem"
              defaultValue={who ?? ""}
              placeholder="Todos"
              options={[
                { value: "pediram", label: "Quem fez o pedido" },
                { value: "acompanhantes", label: "Acompanhantes" },
              ]}
            />
            <FilterCombobox
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
              clearHref={base}
              hasActiveFilters={filtered}
              autoSubmit
            />
          </AutoFilterForm>
        </FilterPanel>

        <FilterResults>
          <Card>
            <EventTicketsTable tickets={tickets.items} filtered={filtered} />
            <Pagination
              page={tickets.page}
              totalPages={tickets.totalPages}
              total={tickets.total}
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
