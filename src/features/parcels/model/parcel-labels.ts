import type { Tone } from "@/design-system";
import type { Parcel, ParcelStatus } from "@/shared/contracts/parcels";
import { formatDateTime } from "@/shared/lib/datetime";

export const PARCEL_STATUS_LABELS: Record<ParcelStatus, string> = {
  RECEIVED: "Aguardando retirada",
  PICKED_UP: "Retirada",
  RETURNED: "Devolvida",
  CANCELLED: "Cancelada",
};

export const PARCEL_STATUS_TONES: Record<ParcelStatus, Tone> = {
  RECEIVED: "warning",
  PICKED_UP: "success",
  RETURNED: "neutral",
  CANCELLED: "danger",
};

/** Pickup codes: 6 characters (invites have 8, event tickets 10). */
export const PARCEL_CODE_LENGTH = 6;
const PARCEL_CODE = /^[23456789ABCDEFGHJKMNPQRSTUVWXYZ]{6}$/;

/** A typed or scanned text as a pickup code (null: not one). */
export function parcelCodeFrom(text: string): string | null {
  const code = text.toUpperCase().replace(/[\s.·-]/g, "");
  return PARCEL_CODE.test(code) ? code : null;
}

/** "ABC 234": easier to read aloud at the gate. */
export const formatParcelCode = (code: string) =>
  `${code.slice(0, 3)} ${code.slice(3)}`;

/** "Correios · para Maria" (or "Encomenda" when nothing was noted). */
export const parcelSummary = (
  parcel: Pick<Parcel, "carrier" | "recipientName">,
) =>
  [parcel.carrier, parcel.recipientName ? `para ${parcel.recipientName}` : null]
    .filter(Boolean)
    .join(" · ") || "Encomenda";

/**
 * Carriers and stores that deliver the most (any other name is typed via
 * "Outros (digitar)").
 */
export const COMMON_CARRIERS = [
  "Correios",
  "Mercado Livre",
  "Amazon",
  "Shopee",
  "Magazine Luiza",
  "Shein",
  "AliExpress",
  "Jadlog",
  "Loggi",
  "Total Express",
  "J&T Express",
  "DHL",
  "FedEx",
] as const;

/** Where parcels are usually kept (any other place can be typed). */
export const COMMON_STORAGE_PLACES = [
  "Portaria",
  "Sala de encomendas",
  "Armário de encomendas",
  "Prateleira",
  "Administração",
  "Geladeira (perecíveis)",
] as const;

/** How a parcel left the condominium's care (null: still waiting). */
export function parcelOutcome(parcel: Parcel): string | null {
  if (!parcel.closedAt) return null;
  const when = formatDateTime(parcel.closedAt);
  if (parcel.status === "PICKED_UP") {
    return `Retirada por ${parcel.signerName ?? "—"} em ${when}${parcel.closedByName ? ` (entregue por ${parcel.closedByName})` : ""}`;
  }
  return `${PARCEL_STATUS_LABELS[parcel.status]} em ${when}${parcel.closeReason ? `: ${parcel.closeReason}` : ""}`;
}

/** Who handed it over, by their profile (the receipt). */
export const COLLECTED_BY_ROLE_LABELS: Record<string, string> = {
  CONCIERGE: "Portaria",
  ADMIN: "Administração",
  ADMIN_MASTER: "Administração",
};

/** Perishable: the deadlines offered (hours after arrival; the API checks). */
export const PERISHABLE_HOURS = [2, 4, 8, 12, 24, 48] as const;
export const PERISHABLE_DEFAULT_HOURS = 4;

/** "Perecível · retire até 20/11 às 14:30" (null: not perishable). */
export function perishableNote(
  parcel: Pick<Parcel, "perishable" | "pickupDeadline" | "status">,
  now: number,
): { text: string; when: string; overdue: boolean } | null {
  if (!parcel.perishable || !parcel.pickupDeadline) return null;
  const overdue =
    parcel.status === "RECEIVED" &&
    new Date(parcel.pickupDeadline).getTime() <= now;
  const when = formatDateTime(parcel.pickupDeadline);
  return {
    overdue,
    when,
    text: overdue
      ? `Perecível · prazo venceu em ${when}`
      : `Perecível · retirar até ${when}`,
  };
}
