import Link from "next/link";
import { MapPin, Ticket, Users } from "lucide-react";
import { Badge, Card, cn } from "@/design-system";
import {
  EVENT_STATUS,
  eventLimits,
  eventPeriod,
  eventPlace,
} from "@/features/events/model/event-labels";
import type { CondominiumEvent } from "@/shared/contracts/events";
import { dateParts } from "@/shared/lib/datetime";

// One event in the list: a calendar-style date, the title, when and where,
// and badges for drafts, cancellations and tickets.
export function EventCard({ event }: { event: CondominiumEvent }) {
  const date = dateParts(event.startsAt);
  const cancelled = event.status === "CANCELLED";
  const limits = eventLimits(event);

  return (
    <Link href={`/eventos/${event.id}`} className="block">
      <Card
        className={cn(
          "flex gap-4 p-4 transition-shadow hover:shadow-pop sm:p-5",
          cancelled && "opacity-70",
        )}
      >
        <div className="grid w-14 shrink-0 place-items-center rounded-xl bg-brand-soft py-2 text-center text-brand-ink">
          <span className="text-[11px] font-semibold uppercase">
            {date.weekday}
          </span>
          <span className="text-2xl leading-none font-extrabold">
            {date.day}
          </span>
          <span className="text-[11px] font-semibold uppercase">
            {date.month}
          </span>
        </div>
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3
              className={cn(
                "text-base font-bold text-fg",
                cancelled && "line-through",
              )}
            >
              {event.title}
            </h3>
            {event.status !== "PUBLISHED" && (
              <Badge tone={EVENT_STATUS[event.status].tone}>
                {EVENT_STATUS[event.status].label}
              </Badge>
            )}
            <Badge tone={event.ticketed ? "brand" : "info"}>
              <Ticket aria-hidden className="size-3" />
              {event.ticketed ? "Ingresso pago" : "Gratuito"}
            </Badge>
          </div>
          <p className="text-sm text-muted">{eventPeriod(event)}</p>
          <p className="flex items-center gap-1.5 text-sm text-muted">
            <MapPin aria-hidden className="size-3.5 shrink-0" />
            <span className="truncate">{eventPlace(event)}</span>
          </p>
          <p className="flex items-center gap-1.5 text-xs text-soft">
            <Users aria-hidden className="size-3.5 shrink-0" />
            {limits}
          </p>
        </div>
      </Card>
    </Link>
  );
}
