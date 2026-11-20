import type { Tone } from "@/design-system";
import type { Parcel, ParcelStatus } from "@/shared/contracts/parcels";

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
