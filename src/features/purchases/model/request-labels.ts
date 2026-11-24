import { unitFor } from "@/features/catalog/model/units";
import type { Tone } from "@/design-system";
import type {
  PurchasePriority,
  PurchaseRequest,
  PurchaseRequestStatus,
} from "@/shared/contracts/purchase-requests";

/** "SC-0007". */
export const requestCode = (number: number) =>
  `SC-${String(number).padStart(4, "0")}`;

export const REQUEST_STATUS_LABELS: Record<PurchaseRequestStatus, string> = {
  OPEN: "Aguardando cotação",
  QUOTING: "Em cotação",
  AWAITING_APPROVAL: "Aguardando aprovação",
  APPROVED: "Aprovada",
  ORDERED: "Pedido feito",
  RECEIVED: "Recebida",
  COMPLETED: "Concluída",
  REJECTED: "Reprovada",
  CANCELLED: "Cancelada",
};

export const REQUEST_STATUS_TONES: Record<PurchaseRequestStatus, Tone> = {
  OPEN: "warning",
  QUOTING: "info",
  AWAITING_APPROVAL: "accent",
  APPROVED: "brand",
  ORDERED: "brand",
  RECEIVED: "success",
  COMPLETED: "success",
  REJECTED: "danger",
  CANCELLED: "neutral",
};

/** Still going: neither finished, rejected nor cancelled. */
export const ACTIVE_REQUEST_STATUSES: PurchaseRequestStatus[] = [
  "OPEN",
  "QUOTING",
  "AWAITING_APPROVAL",
  "APPROVED",
  "ORDERED",
  "RECEIVED",
];

/**
 * Still waiting on someone (quotes or the approval): what the purchases
 * pages show by default; the decided ones only through the filter.
 */
export const PENDING_REQUEST_STATUSES: PurchaseRequestStatus[] = [
  "OPEN",
  "QUOTING",
  "AWAITING_APPROVAL",
];

/** Approved, and the order, the deliveries and the payment after it. */
export const APPROVED_STATUSES: PurchaseRequestStatus[] = [
  "APPROVED",
  "ORDERED",
  "RECEIVED",
  "COMPLETED",
];

export const isApprovedOrLater = (status: PurchaseRequestStatus) =>
  APPROVED_STATUSES.includes(status);

/** Edited and cancelled only before the quotes start. */
export const isEditableRequest = (request: Pick<PurchaseRequest, "status">) =>
  request.status === "OPEN";

/**
 * Mirrors the API: in quotes, the place, date and priority still change
 * (the title, details, items and categories don't: the quotes were made on
 * them).
 */
export const isDetailsEditableRequest = (
  request: Pick<PurchaseRequest, "status">,
) => request.status === "OPEN" || request.status === "QUOTING";

export const PURCHASE_PRIORITIES: PurchasePriority[] = [
  "LOW",
  "NORMAL",
  "HIGH",
  "URGENT",
];

export const PRIORITY_LABELS: Record<PurchasePriority, string> = {
  LOW: "Baixa",
  NORMAL: "Normal",
  HIGH: "Alta",
  URGENT: "Urgente",
};

export const PRIORITY_TONES: Record<PurchasePriority, Tone> = {
  LOW: "neutral",
  NORMAL: "info",
  HIGH: "warning",
  URGENT: "danger",
};

/** "2026-12-01" → "01/12/2026" (a calendar day: no time zone shift). */
export const formatRequestDay = (day: string) =>
  day.split("-").reverse().join("/");

/** "12 un", "2,5 kg", "4 rolos". */
export const formatQuantity = (quantity: number, unit: string) =>
  `${quantity.toLocaleString("pt-BR", { maximumFractionDigits: 2 })} ${unitFor(quantity, unit)}`;

/** "Philips · bivolt": the brand asked for (or any) and the note. */
export const itemSpec = (item: {
  brandName: string | null;
  note: string | null;
}) =>
  [item.brandName ?? "Qualquer marca", item.note].filter(Boolean).join(" · ");

/** "1 item", "3 itens". */
export const itemsCount = (count: number) =>
  count === 1 ? "1 item" : `${count} itens`;
