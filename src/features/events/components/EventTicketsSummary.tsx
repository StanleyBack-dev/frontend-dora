import { CircleCheck, Ticket } from "lucide-react";
import { StatCard } from "@/design-system";
import type { GateEventTicket } from "@/shared/contracts/events";

// The numbers of an event's tickets, whatever the filters: how many, who
// came in, who is still to come, from outside, and how many of each type.
export function EventTicketsSummary({
  tickets,
}: {
  /** Every ticket of the event. */
  tickets: GateEventTicket[];
}) {
  const inside = tickets.filter((ticket) => ticket.checkedInAt).length;
  const outside = tickets.filter((ticket) => ticket.outside).length;
  const counts = new Map<string, number>();
  for (const ticket of tickets) {
    const name = ticket.ticketName ?? "Inscrição";
    counts.set(name, (counts.get(name) ?? 0) + 1);
  }
  const byType = [...counts.entries()].sort((a, b) => b[1] - a[1]);

  return (
    <div className="mb-5 space-y-3">
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
    </div>
  );
}
