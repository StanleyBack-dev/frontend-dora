import type { Tone } from "@/design-system";
import type {
  FoundItem,
  FoundItemCategory,
  FoundItemClaim,
  FoundItemClaimStatus,
  FoundItemStatus,
} from "@/shared/contracts/lost-and-found";
import { formatDateTime, formatLongDay } from "@/shared/lib/datetime";

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

/** A resident's own claim, as they read it. */
export const MY_CLAIM_LABELS: Record<
  FoundItemClaimStatus,
  { label: string; tone: Tone; hint: string }
> = {
  PENDING: {
    label: "Você pediu",
    tone: "info",
    hint: "Retire na portaria com um documento: o porteiro confere se o item é seu e você assina na tela.",
  },
  ACCEPTED: {
    label: "Pode retirar",
    tone: "success",
    hint: "A portaria confirmou: retire lá com um documento e assine na tela.",
  },
  REJECTED: {
    label: "Pedido recusado",
    tone: "danger",
    hint: "A portaria recusou o pedido.",
  },
  WITHDRAWN: {
    label: "Pedido cancelado",
    tone: "neutral",
    hint: "Você cancelou este pedido.",
  },
};

/**
 * A resident's claim as they read it, given what happened to the item: an
 * item that left shows how (returned to them, to someone else, donated,
 * discarded) instead of the claim's own state.
 */
export function myClaimView(
  claim: Pick<FoundItemClaim, "status" | "itemStatus" | "decisionNote">,
): { label: string; tone: Tone; hint: string } {
  switch (claim.itemStatus) {
    case "RETURNED":
      return claim.status === "ACCEPTED"
        ? {
            label: "Devolvido a você",
            tone: "success",
            hint: "Você retirou este item. O comprovante está na página do item.",
          }
        : {
            label: "Entregue a outra pessoa",
            tone: "neutral",
            hint: "A portaria conferiu e entregou este item a outra pessoa.",
          };
    case "DONATED":
      return {
        label: "Item doado",
        tone: "neutral",
        hint: "Este item foi doado.",
      };
    case "DISCARDED":
      return {
        label: "Item descartado",
        tone: "neutral",
        hint: "Este item foi descartado.",
      };
    default: {
      const view = MY_CLAIM_LABELS[claim.status];
      const note = claim.decisionNote
        ? ` ${claim.status === "REJECTED" ? "Motivo" : "Observação"}: ${claim.decisionNote}`
        : "";
      return { ...view, hint: view.hint + note };
    }
  }
}

/** "Sonia · Bloco A · 101" or "Bloco A · 101" (null: not reserved). */
export const reservedFor = (
  item: Pick<FoundItem, "ownerName" | "ownerUnitLabel">,
) =>
  item.ownerUnitLabel
    ? item.ownerName
      ? `${item.ownerName} · ${item.ownerUnitLabel}`
      : item.ownerUnitLabel
    : null;

/** A claim can be made again after it was rejected or withdrawn. */
export const canClaimAgain = (status: FoundItemClaimStatus | undefined) =>
  status === undefined || status === "REJECTED" || status === "WITHDRAWN";

/** A claim's optional note (characters; the API checks). */
export const CLAIM_MESSAGE_MAX = 500;

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
  const until = formatLongDay(item.keepUntil);
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
