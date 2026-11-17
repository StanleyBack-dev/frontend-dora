import { CircleCheck, Ticket } from "lucide-react";
import { StatCard } from "@/design-system";
import type { EventTicketOverview } from "@/shared/contracts/events";

// The numbers of an event's tickets, whatever the filters (counted by the
// API): how many, who came in, who is still to come, from outside, and how
// many of each type.
export function EventTicketsSummary({
  overview,
}: {
  overview: EventTicketOverview;
}) {
  const { total, checkedIn, outside, byType } = overview;

  return (
    <div className="mb-5 space-y-3">
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatCard label="Ingressos" value={String(total)} icon={<Ticket />} />
        <StatCard
          label="Entraram"
          value={String(checkedIn)}
          icon={<CircleCheck />}
          tone="success"
        />
        <StatCard
          label="Faltam"
          value={String(total - checkedIn)}
          icon={<Ticket />}
        />
        <StatCard label="De fora" value={String(outside)} icon={<Ticket />} />
      </div>
      {byType.length > 1 && (
        <p className="text-sm text-muted">
          {byType
            .map(({ name, count }) => `${count} ${name ?? "Inscrição"}`)
            .join(" · ")}
        </p>
      )}
    </div>
  );
}
