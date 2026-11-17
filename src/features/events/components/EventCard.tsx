import Link from "next/link";
import { ArrowUpRight, CalendarClock, MapPin } from "lucide-react";
import { Badge, Card, cn } from "@/design-system";
import {
  EVENT_STATUS,
  eventPeriod,
  eventPlace,
} from "@/features/events/model/event-labels";
import { SpacePhotoCarousel } from "@/features/spaces/components/SpacePhotoCarousel";
import type { CondominiumEvent } from "@/shared/contracts/events";
import type { SpacePhoto } from "@/shared/contracts/spaces";
import { dateParts } from "@/shared/lib/datetime";

/** A number of the card ("1 de 50 lugares", "3 para conferir"). */
export type EventCardStat = {
  icon: React.ReactNode;
  label: string;
  /** Calls attention (something waits for the manager). */
  highlight?: boolean;
};

/** One of the event's own pages, as a button of the card. */
export type EventCardAction = {
  href: string;
  label: string;
  icon: React.ReactNode;
  /** Something waiting there (e.g. orders to check). */
  count?: number;
};

// An event in a list, in the same shape as the Espaços cards: its space's
// photos (when in the condominium and with photos), the date,
// the title, when and where, its numbers and the call to open it (the
// whole card is the link). In the management, the event's own pages
// (Ingressos, Pedidos) are buttons at the bottom, above that link.
export function EventCard({
  event,
  href,
  cta,
  stats,
  badge,
  actions = [],
  photos = [],
}: {
  event: CondominiumEvent;
  href: string;
  /** The call to action at the bottom ("Ver evento"). */
  cta: string;
  stats: EventCardStat[];
  /** A badge beside the status (e.g. what waits for review). */
  badge?: React.ReactNode;
  actions?: EventCardAction[];
  /** The photos of its space in the condominium (none outside). */
  photos?: SpacePhoto[];
}) {
  const date = dateParts(event.startsAt);
  const cancelled = event.status === "CANCELLED";

  return (
    <div className="group relative h-full">
      <Card
        className={cn(
          "relative flex h-full flex-col gap-4 overflow-hidden p-5 transition-all group-hover:-translate-y-0.5 group-hover:border-brand-border",
          cancelled && "opacity-75",
        )}
      >
        {photos.length > 0 && (
          <SpacePhotoCarousel
            photos={photos}
            name={event.spaceName ?? event.title}
            className="-mx-5 -mt-5 aspect-[16/9]"
          />
        )}
        <div className="flex items-start justify-between gap-3">
          <span className="grid w-14 shrink-0 place-items-center rounded-2xl bg-brand py-1.5 text-center text-brand-fg">
            <span className="text-[10px] font-semibold uppercase">
              {date.weekday}
            </span>
            <span className="text-2xl leading-none font-extrabold">
              {date.day}
            </span>
            <span className="text-[10px] font-semibold uppercase">
              {date.month}
            </span>
          </span>
          <div className="flex flex-wrap justify-end gap-1.5">
            {badge}
            {event.status !== "PUBLISHED" && (
              <Badge tone={EVENT_STATUS[event.status].tone}>
                {EVENT_STATUS[event.status].label}
              </Badge>
            )}
            <Badge tone={event.ticketed ? "brand" : "info"}>
              {event.ticketed ? "Ingresso pago" : "Gratuito"}
            </Badge>
          </div>
        </div>
        <div className="min-w-0">
          <h2
            className={cn(
              "truncate text-lg font-bold text-fg",
              cancelled && "line-through",
            )}
          >
            {/* Stretched over the whole card (the ::after layer). */}
            <Link
              href={href}
              className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none"
            >
              {event.title}
            </Link>
          </h2>
          <ul className="mt-1.5 space-y-1 text-[13px] text-muted">
            <li className="flex items-start gap-2">
              <CalendarClock
                aria-hidden
                className="mt-0.5 size-4 shrink-0 text-soft"
              />
              <span>{eventPeriod(event)}</span>
            </li>
            <li className="flex items-start gap-2">
              <MapPin
                aria-hidden
                className="mt-0.5 size-4 shrink-0 text-soft"
              />
              <span className="truncate">{eventPlace(event)}</span>
            </li>
          </ul>
        </div>
        <ul className="mt-auto grid grid-cols-2 gap-2">
          {stats.map((stat) => (
            <li
              key={stat.label}
              className={cn(
                "flex items-center gap-2 rounded-xl px-3 py-2 text-[13px] font-medium [&_svg]:size-4 [&_svg]:shrink-0",
                stat.highlight
                  ? "bg-brand-soft text-brand-ink"
                  : "bg-surface-muted text-muted [&_svg]:text-soft",
              )}
            >
              {stat.icon}
              <span className="truncate">{stat.label}</span>
            </li>
          ))}
        </ul>
        <span className="flex items-center gap-1 text-sm font-semibold text-brand-ink">
          {cta}
          <ArrowUpRight aria-hidden className="size-4" />
        </span>
        {actions.length > 0 && (
          // The event's own pages: a row of equal buttons under a rule,
          // above the card's link (each opens its own page).
          <div
            className={cn(
              "-mx-5 -mb-5 grid gap-2 border-t border-border bg-surface-muted/60 p-3",
              actions.length > 1 ? "grid-cols-2" : "grid-cols-1",
            )}
          >
            {actions.map((action) => (
              <Link
                key={action.href}
                href={action.href}
                className="group/action relative z-10 flex h-10 items-center justify-center gap-2 rounded-xl bg-brand-soft text-sm font-semibold text-brand-ink transition-colors hover:bg-brand hover:text-brand-fg focus-visible:ring-2 focus-visible:ring-brand focus-visible:outline-none [&_svg]:size-4 [&_svg]:shrink-0"
              >
                {action.icon}
                <span className="truncate">{action.label}</span>
                {action.count !== undefined && action.count > 0 && (
                  <span className="grid min-w-5 place-items-center rounded-full bg-brand px-1.5 text-[11px] leading-5 font-bold text-brand-fg group-hover/action:bg-brand-fg group-hover/action:text-brand">
                    {action.count}
                  </span>
                )}
              </Link>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
