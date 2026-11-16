"use client";

import { useCallback, useEffect, useState } from "react";
import { GateConsole } from "@/features/bookings/components/GateConsole";
import { eventsClient } from "@/features/events/api/events.client";
import { EventGateTickets } from "@/features/events/components/EventGateTickets";
import { ticketCodeFrom } from "@/features/events/model/ticket-pass";
import type { GateGuest } from "@/shared/contracts/bookings";
import type { GateEventTicket } from "@/shared/contracts/events";
import { ApiClientError } from "@/shared/lib/api-client";
import { useToast } from "@/shared/toast/useToast";

const REFRESH_MS = 60_000;

// The gate's desk (Portaria): one code field and QR reader for both the
// booking guests' invites (8 characters) and the event tickets (10, or a
// ticket link), then the day's guests and, with the events module, the
// day's tickets. The tickets list refreshes every minute.
export function GateDesk({
  guests,
  tickets: initialTickets,
  events,
}: {
  guests: GateGuest[];
  tickets: GateEventTicket[];
  /** The condominium has the events module. */
  events: boolean;
}) {
  const { showError, showSuccess } = useToast();
  const [tickets, setTickets] = useState(initialTickets);
  const [busy, setBusy] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setTickets(await eventsClient.gateTickets());
    } catch {
      // Keeps the list it has; the next round tries again.
    }
  }, []);

  useEffect(() => {
    if (!events) return;
    const timer = setInterval(() => {
      if (document.visibilityState === "visible") void refresh();
    }, REFRESH_MS);
    return () => clearInterval(timer);
  }, [events, refresh]);

  const replace = (updated: GateEventTicket) =>
    setTickets((list) =>
      list.some((ticket) => ticket.id === updated.id)
        ? list.map((ticket) => (ticket.id === updated.id ? updated : ticket))
        : list,
    );

  async function checkIn(target: {
    attendeeId?: string;
    code?: string;
  }): Promise<boolean> {
    setBusy(target.attendeeId ?? "code");
    try {
      const ticket = await eventsClient.checkInTicket(target);
      replace(ticket);
      if (!tickets.some((item) => item.id === ticket.id)) void refresh();
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
      return true;
    } catch (cause) {
      showError(
        cause instanceof ApiClientError
          ? cause.message
          : "Não foi possível liberar a entrada.",
      );
      return false;
    } finally {
      setBusy(null);
    }
  }

  async function undo(ticket: GateEventTicket) {
    setBusy(ticket.id);
    try {
      replace(await eventsClient.undoTicketCheckIn(ticket.id));
      showSuccess(`Entrada desfeita: ${ticket.name}`);
    } catch (cause) {
      showError(
        cause instanceof ApiClientError
          ? cause.message
          : "Não foi possível desfazer.",
      );
    }
    setBusy(null);
  }

  return (
    <div className="space-y-8">
      <GateConsole
        initial={guests}
        takeCode={
          events
            ? (text) => {
                const code = ticketCodeFrom(text);
                return code ? checkIn({ code }) : null;
              }
            : undefined
        }
      />
      {events && (
        <EventGateTickets
          tickets={tickets}
          busy={busy}
          onCheckIn={(ticket) => void checkIn({ attendeeId: ticket.id })}
          onUndo={(ticket) => void undo(ticket)}
        />
      )}
    </div>
  );
}
