import { PartyPopper, Ticket, Users } from "lucide-react";
import { Card, EmptyState, SegmentedNav } from "@/design-system";
import { EventCard } from "@/features/events/components/EventCard";
import type { CondominiumEvent } from "@/shared/contracts/events";
import type { SpacePhoto } from "@/shared/contracts/spaces";

export type EventsPeriod = "proximos" | "passados";

// The condominium's events, upcoming or past, with the period tabs, as a
// grid of cards (the same shape as the Espaços catalog). Used by the
// resident's list and the management's, which adds each event's buttons
// (Ingressos, Pedidos) to the cards.
export function EventsList({
  events,
  period,
  basePath,
  emptyHint,
  card,
  spacePhotos = {},
}: {
  events: CondominiumEvent[];
  period: EventsPeriod;
  /** The list's address (the period tabs); the events open under it. */
  basePath: string;
  /** What the empty list of upcoming events says. */
  emptyHint: string;
  /** The card of an event (with its space's photos); default: its page
   * and its places. */
  card?: (event: CondominiumEvent, photos: SpacePhoto[]) => React.ReactNode;
  /** The photos of each space of the condominium, by its id. */
  spacePhotos?: Record<string, SpacePhoto[]>;
}) {
  const photosOf = (event: CondominiumEvent) =>
    (event.spaceId && spacePhotos[event.spaceId]) || [];
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
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {events.map((event) =>
            card ? (
              <div key={event.id}>{card(event, photosOf(event))}</div>
            ) : (
              <EventCard
                key={event.id}
                event={event}
                href={`${basePath}/${event.id}`}
                cta="Ver evento"
                stats={placesStats(event)}
                photos={photosOf(event)}
              />
            ),
          )}
        </div>
      )}
    </>
  );
}

/** The places of an event: taken of the total, and how many are left. */
export function placesStats(event: CondominiumEvent) {
  const taken = event.capacity - event.placesLeft;
  return [
    {
      icon: <Ticket aria-hidden />,
      label: `${taken} de ${event.capacity} lugares`,
    },
    {
      icon: <Users aria-hidden />,
      label:
        event.placesLeft > 0
          ? `${event.placesLeft} ${event.placesLeft === 1 ? "vaga" : "vagas"}`
          : "Esgotado",
      highlight: event.placesLeft === 0,
    },
  ];
}
