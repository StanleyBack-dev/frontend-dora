import type { Tone } from "@/design-system";
import type {
  FoundItem,
  FoundItemCategory,
  FoundItemClaimStatus,
  FoundItemStatus,
} from "@/shared/contracts/lost-and-found";
import { formatDateTime, formatShortDay } from "@/shared/lib/datetime";

export const FOUND_ITEM_STATUS_LABELS: Record<FoundItemStatus, string> = {
  FOUND: "Guardado",
  RETURNED: "Devolvido",
  DONATED: "Doado",
  DISCARDED: "Descartado",
};

export const FOUND_ITEM_STATUS_TONES: Record<FoundItemStatus, Tone> = {
  FOUND: "warning",
  RETURNED: "success",
  DONATED: "info",
  DISCARDED: "neutral",
};

export const FOUND_ITEM_CATEGORY_LABELS: Record<FoundItemCategory, string> = {
  DOCUMENT: "Documento",
  KEYS: "Chaves",
  ELECTRONICS: "Eletrônico",
  CLOTHING: "Roupa ou calçado",
  ACCESSORY: "Acessório",
  BAG: "Bolsa, mochila ou carteira",
  TOY: "Brinquedo",
  OTHER: "Outro",
};

/** In the order the forms and filters list them. */
export const FOUND_ITEM_CATEGORIES = Object.keys(
  FOUND_ITEM_CATEGORY_LABELS,
) as FoundItemCategory[];

export const CLAIM_STATUS_LABELS: Record<FoundItemClaimStatus, string> = {
  PENDING: "Aguardando",
  ACCEPTED: "Aceito",
  REJECTED: "Recusado",
  WITHDRAWN: "Cancelado pelo morador",
};

export const CLAIM_STATUS_TONES: Record<FoundItemClaimStatus, Tone> = {
  PENDING: "warning",
  ACCEPTED: "success",
  REJECTED: "danger",
  WITHDRAWN: "neutral",
};

/** A document's photo is hidden from the residents by default (privacy). */
export const hidesPhotoByDefault = (category: FoundItemCategory) =>
  category === "DOCUMENT";

/** Where things are usually found (any other place can be typed). */
export const COMMON_FOUND_PLACES = [
  "Hall de entrada",
  "Elevador",
  "Garagem",
  "Piscina",
  "Academia",
  "Salão de festas",
  "Churrasqueira",
  "Playground",
  "Quadra",
  "Jardim",
] as const;

/** Where found items are usually kept (any other place can be typed). */
export const COMMON_FOUND_STORAGE = [
  "Portaria",
  "Administração",
  "Armário de achados e perdidos",
] as const;

const DAY_MS = 86_400_000;

/** "Guardado até 18/02 · faltam 5 dias" (null: no longer kept). */
export function keepNote(
  item: Pick<FoundItem, "status" | "keepUntil">,
  now: number,
): { text: string; tone: Tone } | null {
  if (item.status !== "FOUND") return null;
  const left = Math.ceil((new Date(item.keepUntil).getTime() - now) / DAY_MS);
  const until = formatShortDay(item.keepUntil);
  if (left <= 0) return { text: `Guarda venceu em ${until}`, tone: "danger" };
  if (left <= 7) {
    return {
      text: `Guarda até ${until} · ${left === 1 ? "falta 1 dia" : `faltam ${left} dias`}`,
      tone: "warning",
    };
  }
  return { text: `Guarda até ${until}`, tone: "neutral" };
}

/** How the item left the condominium's care (null: still kept). */
export function foundItemOutcome(item: FoundItem): string | null {
  if (!item.closedAt) return null;
  const when = formatDateTime(item.closedAt);
  if (item.status === "RETURNED") {
    return `Devolvido a ${item.signerName ?? item.returnedToName ?? "—"} em ${when}${item.closedByName ? ` (entregue por ${item.closedByName})` : ""}`;
  }
  return `${FOUND_ITEM_STATUS_LABELS[item.status]} em ${when}${item.closeReason ? `: ${item.closeReason}` : ""}`;
}
