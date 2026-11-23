import { PAYMENT_METHOD_LABELS } from "@/features/purchases/model/quote-labels";
import type {
  OrderBoardRow,
  PurchaseInstallment,
  PurchaseOrder,
} from "@/shared/contracts/purchase-orders";
import { localDay } from "@/shared/lib/datetime";

export const MAX_ORDER_NOTES = 500;
export const MAX_RECEIPT_NOTE = 300;
export const MAX_PAYMENT_NOTE = 300;
export const MAX_RATING_COMMENT = 300;
export const MAX_INVOICE_NUMBER = 40;

/** "OC-0007". */
export const orderCode = (number: number) =>
  `OC-${String(number).padStart(4, "0")}`;

/** "PIX", "Boleto · 3 parcelas", or the terms typed. */
export function paymentLabel(
  order: Pick<PurchaseOrder, "paymentMethod" | "paymentTerms">,
  installments: number,
): string {
  const method = order.paymentMethod
    ? order.paymentMethod === "OTHER"
      ? (order.paymentTerms ?? PAYMENT_METHOD_LABELS.OTHER)
      : PAYMENT_METHOD_LABELS[order.paymentMethod]
    : "A combinar";
  return installments > 1 ? `${method} · ${installments} parcelas` : method;
}

/** "Tudo recebido", "Em parte · 1 de 3 itens completos", "0 de 3 itens". */
export function deliveryProgress(
  row: Pick<OrderBoardRow, "itemsReceived" | "itemCount" | "receiptCount">,
): string {
  if (row.itemsReceived === row.itemCount) return "Tudo recebido";
  const items = `${row.itemsReceived} de ${row.itemCount} ${row.itemCount === 1 ? "item" : "itens"}`;
  if (row.receiptCount === 0) return items;
  return `Em parte · ${items} ${row.itemCount === 1 ? "completo" : "completos"}`;
}

export type InstallmentState = "paid" | "overdue" | "open";

export const INSTALLMENT_BADGES = {
  paid: { tone: "success", label: "Paga" },
  overdue: { tone: "danger", label: "Vencida" },
  open: { tone: "neutral", label: "Em aberto" },
} as const;

/** "Parcela 2" or, paid at once, "Pagamento". */
export const installmentName = (number: number, count: number) =>
  count > 1 ? `Parcela ${number}` : "Pagamento";

export const installmentState = (
  installment: Pick<PurchaseInstallment, "paidOn" | "dueOn">,
  today = localDay(new Date()),
): InstallmentState =>
  installment.paidOn ? "paid" : installment.dueOn < today ? "overdue" : "open";

/** "2,5" from 2.5, for a quantity field (empty for zero). */
export const quantityField = (value: number) =>
  value === 0 ? "" : String(value).replace(".", ",");

/**
 * The due days of `count` monthly installments from the first, keeping its
 * day of the month (the 31st falls on the month's last day).
 */
export function monthlyDueDays(first: string, count: number): string[] {
  const [year, month, day] = first.split("-").map(Number);
  return Array.from({ length: count }, (_, index) => {
    const months = month - 1 + index;
    const y = year + Math.floor(months / 12);
    const m = (months % 12) + 1;
    const d = Math.min(day, new Date(Date.UTC(y, m, 0)).getUTCDate());
    return `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
  });
}

/** "1 parcela", "3 parcelas". */
export const installmentsCount = (value: number) =>
  value === 1 ? "1 parcela" : `${value} parcelas`;
