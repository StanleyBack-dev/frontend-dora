import { PartyPopper } from "lucide-react";
import { Card, EmptyState, SegmentedNav } from "@/design-system";
import { EventCard } from "@/features/events/components/EventCard";
import type { CondominiumEvent } from "@/shared/contracts/events";

export type EventsPeriod = "proximos" | "passados";

// The condominium's events, upcoming or past, with the period tabs. Used by
// the resident's list (/eventos) and the management's (/gestao/eventos),
// each opening the events in its own area.
export function EventsList({
  events,
  period,
  basePath,
  emptyHint,
}: {
  events: CondominiumEvent[];
  period: EventsPeriod;
  /** The list's address; the events open under it. */
  basePath: string;
  /** What the empty list of upcoming events says. */
  emptyHint: string;
}) {
  return (
    <>
      <SegmentedNav
        label="Período"
        className="mb-4"
        items={[
          {
            label: "Próximos",
            href: basePath,
            active: period === "proximos",
          },
          {
            label: "Passados",
            href: `${basePath}?quando=passados`,
            active: period === "passados",
          },
        ]}
      />
      {events.length === 0 ? (
        <Card>
          <EmptyState
            icon={<PartyPopper className="size-5" />}
            title={
              period === "passados"
                ? "Nenhum evento passado"
                : "Nenhum evento marcado"
            }
            description={
              period === "passados"
                ? "Os eventos que já aconteceram aparecem aqui."
                : emptyHint
            }
          />
        </Card>
      ) : (
        <div className="space-y-3">
          {events.map((event) => (
            <EventCard key={event.id} event={event} basePath={basePath} />
          ))}
        </div>
      )}
    </>
  );
}
