import type { Tone } from "@/design-system";
import type {
  CondominiumEvent,
  EventAddress,
  EventStatus,
} from "@/shared/contracts/events";
import {
  formatLongDay,
  formatShortDay,
  formatTime,
} from "@/shared/lib/datetime";

export const EVENT_STATUS: Record<EventStatus, { label: string; tone: Tone }> =
  {
    DRAFT: { label: "Rascunho", tone: "neutral" },
    PUBLISHED: { label: "Publicado", tone: "success" },
    CANCELLED: { label: "Cancelado", tone: "danger" },
  };

/** "Rua das Flores, 120 - Setor Sul, Goiânia/GO, 74000-100". */
export function formatEventAddress(address: EventAddress): string {
  const zip = `${address.zip.slice(0, 5)}-${address.zip.slice(5)}`;
  const line = [address.street, address.number, address.complement]
    .filter(Boolean)
    .join(", ");
  return `${line} - ${address.district}, ${address.city}/${address.state}, ${zip}`;
}

/** "Salão de Festas · área coberta", or the place outside by name. */
export const eventPlace = (
  event: Pick<CondominiumEvent, "spaceName" | "location" | "address">,
) =>
  [event.spaceName, event.location].filter(Boolean).join(" · ") ||
  (event.address
    ? `${event.address.street}, ${event.address.number} - ${event.address.city}/${event.address.state}`
    : "");

const sameDay = (a: string, b: string) => formatLongDay(a) === formatLongDay(b);

/**
 * "sábado, 20 de dezembro · 19:00 às 23:00", or across days
 * "sáb., 20 de dez. 19:00 até dom., 21 de dez. 02:00".
 */
export function eventPeriod(
  event: Pick<CondominiumEvent, "startsAt" | "endsAt">,
): string {
  return sameDay(event.startsAt, event.endsAt)
    ? `${formatLongDay(event.startsAt)} · ${formatTime(event.startsAt)} às ${formatTime(event.endsAt)}`
    : `${formatShortDay(event.startsAt)} ${formatTime(event.startsAt)} até ${formatShortDay(event.endsAt)} ${formatTime(event.endsAt)}`;
}

/** "Até 150 pessoas · 40 convidados de fora" (or "· Só moradores"). */
export function eventLimits(
  event: Pick<CondominiumEvent, "capacity" | "externalGuestLimit">,
): string {
  const guests =
    event.externalGuestLimit === 0
      ? "Só moradores"
      : `${event.externalGuestLimit} convidado${event.externalGuestLimit === 1 ? "" : "s"} de fora`;
  return `Até ${event.capacity} pessoas · ${guests}`;
}

/** Whether the event can still change (not cancelled, not over). */
export const isEventOpen = (
  event: Pick<CondominiumEvent, "status" | "endsAt">,
  now: number,
) => event.status !== "CANCELLED" && new Date(event.endsAt).getTime() > now;
