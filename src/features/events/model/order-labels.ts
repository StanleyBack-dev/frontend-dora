import type { Tone } from "@/design-system";
import type {
  EventOrder,
  EventOrderStatus,
  TicketType,
} from "@/shared/contracts/events";

export const ORDER_STATUS: Record<
  EventOrderStatus,
  { label: string; tone: Tone }
> = {
  PENDING_PAYMENT: { label: "Aguardando envio", tone: "warning" },
  AWAITING_REVIEW: { label: "Em conferência", tone: "info" },
  CONFIRMED: { label: "Confirmado", tone: "success" },
  REJECTED: { label: "Recusado", tone: "danger" },
  EXPIRED: { label: "Expirado", tone: "neutral" },
  CANCELLED: { label: "Cancelado", tone: "neutral" },
};

/** "1 pessoa", "3 pessoas". */
export const peopleCount = (order: Pick<EventOrder, "attendees">) =>
  order.attendees.length === 1
    ? "1 pessoa"
    : `${order.attendees.length} pessoas`;

/** The ticket types that fit an age (no range: any age). */
export const typesForAge = (types: TicketType[], age: number | null) =>
  age === null
    ? types
    : types.filter(
        (type) =>
          (type.minAge === null || age >= type.minAge) &&
          (type.maxAge === null || age <= type.maxAge),
      );

/** Orders that still count for the person (not given up or refused). */
export const isActiveOrder = (order: Pick<EventOrder, "status">) =>
  order.status === "PENDING_PAYMENT" ||
  order.status === "AWAITING_REVIEW" ||
  order.status === "CONFIRMED";
