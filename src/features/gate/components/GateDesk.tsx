"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ChevronsDownUp,
  ChevronsUpDown,
  CircleCheck,
  DoorOpen,
  Users,
} from "lucide-react";
import { Button, Card, EmptyState, StatCard } from "@/design-system";
import { bookingsClient } from "@/features/bookings/api/bookings.client";
import { eventsClient } from "@/features/events/api/events.client";
import { ticketCodeFrom } from "@/features/events/model/ticket-pass";
import { GateCodeForm } from "@/features/gate/components/GateCodeForm";
import { GateFilters } from "@/features/gate/components/GateFilters";
import { GateOccasionCard } from "@/features/gate/components/GateOccasionCard";
import {
  buildAgenda,
  filterAgenda,
  hasFilters,
  NO_FILTERS,
  type GateEntry,
  type GateFilters as Filters,
} from "@/features/gate/model/gate-agenda";
import type { GateGuest } from "@/shared/contracts/bookings";
import type { GateEventTicket } from "@/shared/contracts/events";
import { ApiClientError } from "@/shared/lib/api-client";
import { useToast } from "@/shared/toast/useToast";

const REFRESH_MS = 60_000;

const errorMessage = (cause: unknown, fallback: string) =>
  cause instanceof ApiClientError ? cause.message : fallback;

// The gate's desk (Portaria and its full screen). One code field and QR
// reader for both booking invites (8 characters) and event tickets (10, or a
// ticket link); the day's numbers; the filters; and one agenda of the day
// where every booking and event is a card that opens to its people, the
// ones with the entry open first. Both lists refresh every minute.
export function GateDesk({
  guests: initialGuests,
  tickets: initialTickets,
  events,
}: {
  guests: GateGuest[];
  tickets: GateEventTicket[];
  /** The condominium has the events module. */
  events: boolean;
}) {
  const { showError, showSuccess } = useToast();
  const [guests, setGuests] = useState(initialGuests);
  const [tickets, setTickets] = useState(initialTickets);
  const [busy, setBusy] = useState<string | null>(null);
  const [filters, setFilters] = useState<Filters>(NO_FILTERS);
  // Cards the person opened or closed by hand (the rest follow the default).
  const [toggled, setToggled] = useState<Record<string, boolean>>({});

  const refresh = useCallback(async () => {
    const [nextGuests, nextTickets] = await Promise.all([
      bookingsClient.gateGuests().catch(() => null),
      events ? eventsClient.gateTickets().catch(() => null) : null,
    ]);
    // A failed round keeps the list it has; the next one tries again.
    if (nextGuests) setGuests(nextGuests);
    if (nextTickets) setTickets(nextTickets);
  }, [events]);

  useEffect(() => {
    const timer = setInterval(() => {
      if (document.visibilityState === "visible") void refresh();
    }, REFRESH_MS);
    return () => clearInterval(timer);
  }, [refresh]);

  const agenda = useMemo(() => buildAgenda(guests, tickets), [guests, tickets]);
  const shown = useMemo(() => filterAgenda(agenda, filters), [agenda, filters]);
  const filtered = hasFilters(filters);

  // Open by default: the occasions with the entry open now, every result of
  // a filter, or everything when the day has few.
  const isOpen = (key: string, phase: string) =>
    toggled[key] ?? (filtered || agenda.length <= 2 || phase === "NOW");
  const setAll = (open: boolean) =>
    setToggled(Object.fromEntries(shown.map((item) => [item.key, open])));

  const people = agenda.reduce((sum, item) => sum + item.total, 0);
  const inside = agenda.reduce((sum, item) => sum + item.inside, 0);
  const waiting = agenda.reduce(
    (sum, item) =>
      sum +
      item.entries.filter(
        (entry) => !entry.checkedInAt && entry.window === "OPEN",
      ).length,
    0,
  );

  const updateGuest = (updated: GateGuest) =>
    setGuests((list) =>
      list.map((guest) => (guest.id === updated.id ? updated : guest)),
    );
  const updateTicket = (updated: GateEventTicket) =>
    setTickets((list) =>
      list.map((ticket) => (ticket.id === updated.id ? updated : ticket)),
    );

  async function letIn(target: {
    kind: GateEntry["kind"];
    id?: string;
    code?: string;
  }): Promise<boolean> {
    setBusy(target.id ?? "code");
    try {
      if (target.kind === "ticket") {
        const ticket = await eventsClient.checkInTicket({
          attendeeId: target.id,
          code: target.code,
        });
        if (tickets.some((item) => item.id === ticket.id)) updateTicket(ticket);
        else void refresh();
        showSuccess(
          `Entrada liberada: ${ticket.name}`,
          [
            ticket.eventTitle,
            ticket.ticketName,
            ticket.outside ? "de fora" : null,
          ]
            .filter(Boolean)
            .join(" · "),
        );
      } else {
        const guest = await bookingsClient.checkIn({
          guestId: target.id,
          code: target.code,
        });
        if (guests.some((item) => item.id === guest.id)) updateGuest(guest);
        else void refresh();
        showSuccess(
          `Entrada liberada: ${guest.name}`,
          `${guest.spaceName} · convidado de ${guest.hostName}`,
        );
      }
      return true;
    } catch (cause) {
      showError(errorMessage(cause, "Não foi possível liberar a entrada."));
      return false;
    } finally {
      setBusy(null);
    }
  }

  async function undo(entry: GateEntry) {
    setBusy(entry.id);
    try {
      if (entry.kind === "ticket") {
        updateTicket(await eventsClient.undoTicketCheckIn(entry.id));
      } else {
        updateGuest(await bookingsClient.undoCheckIn(entry.id));
      }
      showSuccess(`Entrada desfeita: ${entry.name}`);
    } catch (cause) {
      showError(errorMessage(cause, "Não foi possível desfazer."));
    }
    setBusy(null);
  }

  // A typed or scanned code: an event ticket (10 characters or its link)
  // or a booking invite.
  const takeCode = (text: string) => {
    const ticketCode = events ? ticketCodeFrom(text) : null;
    return ticketCode
      ? letIn({ kind: "ticket", code: ticketCode })
      : letIn({ kind: "guest", code: text });
  };

  return (
    <div className="space-y-6">
      <GateCodeForm
        label={events ? "Código do convite ou ingresso" : "Código do convite"}
        busy={busy === "code"}
        disabled={busy !== null}
        onCode={takeCode}
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          label={events ? "Reservas e eventos" : "Reservas hoje"}
          value={agenda.length}
          icon={<Users className="size-4" />}
          tone="neutral"
        />
        <StatCard
          label="Pessoas esperadas"
          value={people}
          icon={<Users className="size-4" />}
          tone="info"
        />
        <StatCard
          label="Aguardando agora"
          value={waiting}
          icon={<DoorOpen className="size-4" />}
          tone="brand"
        />
        <StatCard
          label="Já entraram"
          value={inside}
          icon={<CircleCheck className="size-4" />}
          tone="success"
        />
      </div>

      <GateFilters
        filters={filters}
        onChange={setFilters}
        occasions={agenda}
        events={events}
      />

      {shown.length === 0 ? (
        <Card>
          <EmptyState
            icon={<Users className="size-5" />}
            title={filtered ? "Ninguém encontrado" : "Ninguém esperado hoje"}
            description={
              filtered
                ? "Tente outro nome, documento, unidade ou limpe os filtros."
                : events
                  ? "Os convidados das reservas e os ingressos dos eventos do dia aparecem aqui."
                  : "Os convidados das reservas do dia aparecem aqui."
            }
          />
        </Card>
      ) : (
        <section aria-label="Agenda do dia" className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-base font-semibold text-fg">
              Agenda de hoje
              <span className="ml-2 text-sm font-normal text-muted">
                {shown.length}{" "}
                {shown.length === 1 ? "acontecimento" : "acontecimentos"}
              </span>
            </h2>
            {shown.length > 1 && (
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  icon={<ChevronsUpDown className="size-4" />}
                  onClick={() => setAll(true)}
                >
                  Abrir todos
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  icon={<ChevronsDownUp className="size-4" />}
                  onClick={() => setAll(false)}
                >
                  Recolher todos
                </Button>
              </div>
            )}
          </div>
          {shown.map((item) => (
            <GateOccasionCard
              key={item.key}
              occasion={item}
              open={isOpen(item.key, item.phase)}
              onToggle={() =>
                setToggled((current) => ({
                  ...current,
                  [item.key]: !isOpen(item.key, item.phase),
                }))
              }
              busy={busy}
              onCheckIn={(entry) =>
                void letIn({ kind: entry.kind, id: entry.id })
              }
              onUndo={(entry) => void undo(entry)}
            />
          ))}
        </section>
      )}
    </div>
  );
}
