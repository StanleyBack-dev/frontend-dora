"use client";

import { useMemo, useState } from "react";
import { CircleCheck, Search, Ticket } from "lucide-react";
import {
  Badge,
  Card,
  DataTable,
  EmptyState,
  StatCard,
  cn,
  type DataTableColumn,
} from "@/design-system";
import { CopyShareValue } from "@/features/admin/components/CopyShareValue";
import type { GateEventTicket } from "@/shared/contracts/events";
import { formatTime } from "@/shared/lib/datetime";

type Filter = "all" | "in" | "out";

const FILTERS: { value: Filter; label: string }[] = [
  { value: "all", label: "Todos" },
  { value: "in", label: "Entraram" },
  { value: "out", label: "Ainda não entraram" },
];

const normalize = (value: string) =>
  value.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();

// An event's tickets for its managers: how many, who came in (and when),
// who is still to come, by ticket type, with a search. Each row: the
// person (who ordered stands out), the age, the entry and the ticket; the
// chevron opens the unit, who ordered and the codes to copy. Read-only: the gate
// (Portaria) lets people in.
export function EventTicketsBoard({ tickets }: { tickets: GateEventTicket[] }) {
  const [filter, setFilter] = useState<Filter>("all");
  const [search, setSearch] = useState("");

  const inside = tickets.filter((ticket) => ticket.checkedInAt).length;
  const outside = tickets.filter((ticket) => ticket.outside).length;
  const byType = useMemo(() => {
    const counts = new Map<string, number>();
    for (const ticket of tickets) {
      const name = ticket.ticketName ?? "Inscrição";
      counts.set(name, (counts.get(name) ?? 0) + 1);
    }
    return [...counts.entries()].sort((a, b) => b[1] - a[1]);
  }, [tickets]);

  const rows = useMemo(() => {
    const term = normalize(search);
    return tickets.filter(
      (ticket) =>
        (filter === "all" ||
          (filter === "in" ? ticket.checkedInAt : !ticket.checkedInAt)) &&
        (!term ||
          normalize(
            `${ticket.name} ${ticket.buyerName ?? ""} ${ticket.unitLabel ?? ""} ${ticket.ticketCode} ${ticket.orderCode}`,
          ).includes(term)),
    );
  }, [tickets, filter, search]);

  const columns: DataTableColumn<GateEventTicket>[] = [
    {
      key: "name",
      label: "Pessoa",
      mobile: "title",
      render: (ticket) => <PersonName ticket={ticket} />,
      renderMobile: (ticket) => <PersonName ticket={ticket} withAge />,
    },
    {
      key: "age",
      label: "Idade",
      mobile: "hidden",
      className: "whitespace-nowrap",
      render: (ticket) => `${ticket.age} anos`,
    },
    {
      key: "entry",
      label: "Entrada",
      mobile: "subtitle",
      className: "whitespace-nowrap",
      render: (ticket) =>
        ticket.checkedInAt ? (
          <Badge tone="success">
            <CircleCheck aria-hidden className="mr-1 size-3.5" />
            Entrou às {formatTime(ticket.checkedInAt)}
          </Badge>
        ) : (
          <Badge tone="neutral">Não entrou</Badge>
        ),
    },
    {
      key: "type",
      label: "Ingresso",
      render: (ticket) => ticket.ticketName ?? "Inscrição",
    },
    // Under the row: where they live, who ordered and the codes to copy.
    {
      key: "unit",
      label: "Unidade",
      desktop: "detail",
      render: (ticket) => ticket.unitLabel ?? "—",
    },
    {
      key: "buyer",
      label: "Pedido por",
      desktop: "detail",
      render: (ticket) =>
        ticket.source === "SELF"
          ? "A própria pessoa"
          : (ticket.buyerName ?? "Conta removida"),
    },
    {
      key: "ticketCode",
      label: "Código do ingresso",
      desktop: "detail",
      render: (ticket) => (
        <CopyShareValue
          value={ticket.ticketCode}
          label="Código do ingresso"
          share={false}
          valueClassName="font-mono text-fg"
        />
      ),
    },
    {
      key: "orderCode",
      label: "Código do pedido",
      desktop: "detail",
      render: (ticket) => (
        <CopyShareValue
          value={ticket.orderCode}
          label="Código do pedido"
          share={false}
          valueClassName="font-mono text-fg"
        />
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatCard
          label="Ingressos"
          value={String(tickets.length)}
          icon={<Ticket />}
        />
        <StatCard
          label="Entraram"
          value={String(inside)}
          icon={<CircleCheck />}
          tone="success"
        />
        <StatCard
          label="Faltam"
          value={String(tickets.length - inside)}
          icon={<Ticket />}
        />
        <StatCard label="De fora" value={String(outside)} icon={<Ticket />} />
      </div>

      {byType.length > 1 && (
        <p className="text-sm text-muted">
          {byType.map(([name, count]) => `${count} ${name}`).join(" · ")}
        </p>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div
          role="tablist"
          aria-label="Entrada"
          className="flex flex-wrap gap-1.5"
        >
          {FILTERS.map((item) => (
            <button
              key={item.value}
              type="button"
              role="tab"
              aria-selected={filter === item.value}
              onClick={() => setFilter(item.value)}
              className={cn(
                "rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors",
                filter === item.value
                  ? "border-brand bg-brand text-brand-fg"
                  : "border-border text-muted hover:bg-surface-muted hover:text-fg",
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
        <label className="relative block sm:w-72">
          <span className="sr-only">Buscar ingresso</span>
          <Search
            aria-hidden
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-soft"
          />
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Nome, unidade, código…"
            className="h-10 w-full rounded-lg border border-border bg-surface pr-3 pl-9 text-sm text-fg placeholder:text-soft focus:border-brand focus:outline-none"
          />
        </label>
      </div>

      <Card>
        {rows.length === 0 ? (
          <EmptyState
            icon={<Ticket className="size-5" />}
            title={
              tickets.length === 0 ? "Nenhum ingresso ainda" : "Ninguém aqui"
            }
            description={
              tickets.length === 0
                ? "Os ingressos aparecem quando os pedidos forem confirmados."
                : "Tente outra busca ou outro filtro."
            }
          />
        ) : (
          <DataTable
            rows={rows}
            columns={columns}
            getId={(ticket) => ticket.id}
          />
        )}
      </Card>
    </div>
  );
}

// The person of a ticket: who ordered stands out (a "Quem pediu" badge
// and the name in bold); the others say whose order they came in.
function PersonName({
  ticket,
  withAge = false,
}: {
  ticket: GateEventTicket;
  /** Phones: the age beside the name (no column there). */
  withAge?: boolean;
}) {
  const buyer = ticket.source === "SELF";
  return (
    <span className="flex min-w-0 flex-col gap-0.5">
      <span className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
        <span
          className={cn(
            "truncate",
            buyer ? "font-bold text-fg" : "font-medium text-fg",
          )}
        >
          {ticket.name}
        </span>
        {withAge && (
          <span className="text-xs font-normal text-soft">
            {ticket.age} anos
          </span>
        )}
        {buyer && <Badge tone="brand">Quem pediu</Badge>}
        {ticket.outside && <Badge tone="neutral">De fora</Badge>}
      </span>
      {!buyer && (
        <span className="truncate text-xs text-soft">
          No pedido de {ticket.buyerName ?? "morador"}
        </span>
      )}
    </span>
  );
}
