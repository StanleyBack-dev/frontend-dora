"use client";

import { useMemo, useState } from "react";
import { CircleCheck, DoorOpen, RotateCcw, Search, Ticket } from "lucide-react";
import { Badge, Button, Card, EmptyState, cn } from "@/design-system";
import { formatSlot } from "@/features/bookings/model/booking-labels";
import type { GateEventTicket } from "@/shared/contracts/events";
import { formatTime } from "@/shared/lib/datetime";

const normalize = (value: string) =>
  value.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();

type Group = {
  eventId: string;
  eventTitle: string;
  placeName: string;
  startsAt: string;
  endsAt: string;
  tickets: GateEventTicket[];
};

// The day's event tickets at the gate, by event: each person with who
// ordered and the entry tapped from the list (or undone). The code typed or
// read from the QR is handled by the page's code field.
export function EventGateTickets({
  tickets,
  busy,
  onCheckIn,
  onUndo,
}: {
  tickets: GateEventTicket[];
  /** What is being saved now ("code" or a ticket id). */
  busy: string | null;
  onCheckIn: (ticket: GateEventTicket) => void;
  onUndo: (ticket: GateEventTicket) => void;
}) {
  const [search, setSearch] = useState("");

  const groups = useMemo(() => {
    const term = normalize(search);
    const map = new Map<string, Group>();
    for (const ticket of tickets) {
      const haystack = normalize(
        `${ticket.name} ${ticket.buyerName ?? ""} ${ticket.unitLabel ?? ""} ${ticket.ticketCode} ${ticket.orderCode}`,
      );
      if (term && !haystack.includes(term)) continue;
      const group = map.get(ticket.eventId) ?? {
        eventId: ticket.eventId,
        eventTitle: ticket.eventTitle,
        placeName: ticket.placeName,
        startsAt: ticket.startsAt,
        endsAt: ticket.endsAt,
        tickets: [],
      };
      group.tickets.push(ticket);
      map.set(ticket.eventId, group);
    }
    return [...map.values()];
  }, [tickets, search]);

  const inside = tickets.filter((ticket) => ticket.checkedInAt).length;

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-semibold text-fg">Eventos de hoje</h2>
          <p className="text-sm text-muted">
            {tickets.length} ingresso{tickets.length === 1 ? "" : "s"} ·{" "}
            {inside} já entr{inside === 1 ? "ou" : "aram"}
          </p>
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

      {groups.length === 0 ? (
        <Card>
          <EmptyState
            icon={<Ticket className="size-5" />}
            title={search ? "Ninguém encontrado" : "Nenhum ingresso hoje"}
            description={
              search
                ? "Tente outro nome, unidade ou código."
                : "Os ingressos confirmados dos eventos do dia aparecem aqui."
            }
          />
        </Card>
      ) : (
        groups.map((group) => (
          <Card key={group.eventId}>
            <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-border px-4 py-3 sm:px-5">
              <p className="font-semibold text-fg">
                {group.eventTitle}
                <span className="ml-2 text-sm font-normal text-muted tabular-nums">
                  {formatSlot(group.startsAt, group.endsAt)}
                </span>
              </p>
              <p className="text-sm text-muted">{group.placeName}</p>
            </div>
            <ul className="divide-y divide-border">
              {group.tickets.map((ticket) => (
                <TicketRow
                  key={ticket.id}
                  ticket={ticket}
                  busy={busy}
                  onCheckIn={() => onCheckIn(ticket)}
                  onUndo={() => onUndo(ticket)}
                />
              ))}
            </ul>
          </Card>
        ))
      )}
    </section>
  );
}

/** One ticket: the person, who ordered, and the entry action. */
function TicketRow({
  ticket,
  busy,
  onCheckIn,
  onUndo,
}: {
  ticket: GateEventTicket;
  busy: string | null;
  onCheckIn: () => void;
  onUndo: () => void;
}) {
  return (
    <li className="flex flex-wrap items-center gap-3 px-4 py-3 sm:px-5">
      <div className="min-w-0 flex-1">
        <p
          className={cn(
            "flex flex-wrap items-center gap-x-2 font-medium",
            ticket.checkedInAt ? "text-muted" : "text-fg",
          )}
        >
          <span className="truncate">{ticket.name}</span>
          <span className="text-xs font-normal text-soft">
            {ticket.age} anos
          </span>
          {ticket.outside && <Badge tone="neutral">De fora</Badge>}
        </p>
        <p className="truncate text-xs text-muted">
          {[
            ticket.ticketName,
            ticket.source === "SELF"
              ? "Quem pediu"
              : `Pedido de ${ticket.buyerName ?? "morador"}`,
            ticket.unitLabel,
            `Código ${ticket.ticketCode}`,
          ]
            .filter(Boolean)
            .join(" · ")}
        </p>
      </div>
      <TicketAction
        ticket={ticket}
        busy={busy === ticket.id}
        disabled={busy !== null}
        onCheckIn={onCheckIn}
        onUndo={onUndo}
      />
    </li>
  );
}

function TicketAction({
  ticket,
  busy,
  disabled,
  onCheckIn,
  onUndo,
}: {
  ticket: GateEventTicket;
  busy: boolean;
  disabled: boolean;
  onCheckIn: () => void;
  onUndo: () => void;
}) {
  if (ticket.checkedInAt) {
    return (
      <div className="flex items-center gap-2">
        <Badge tone="success">
          <CircleCheck aria-hidden className="mr-1 size-3.5" />
          Entrou às {formatTime(ticket.checkedInAt)}
        </Badge>
        <button
          type="button"
          onClick={onUndo}
          disabled={disabled}
          title="Desfazer a entrada"
          aria-label={`Desfazer a entrada de ${ticket.name}`}
          className="grid size-8 place-items-center rounded-md text-soft transition-colors hover:bg-surface-muted hover:text-fg disabled:opacity-50"
        >
          <RotateCcw aria-hidden className="size-4" />
        </button>
      </div>
    );
  }
  if (ticket.entryWindow === "OPEN") {
    return (
      <Button
        size="sm"
        onClick={onCheckIn}
        loading={busy}
        disabled={disabled}
        icon={<DoorOpen className="size-4" />}
      >
        Liberar entrada
      </Button>
    );
  }
  if (ticket.entryWindow === "TOO_EARLY") {
    const opens = new Date(new Date(ticket.startsAt).getTime() - 3 * 3_600_000);
    return (
      <Badge tone="neutral">
        Entrada a partir das {formatTime(opens.toISOString())}
      </Badge>
    );
  }
  return (
    <Badge tone="neutral">
      {ticket.entryWindow === "CANCELLED" ? "Evento cancelado" : "Encerrado"}
    </Badge>
  );
}
