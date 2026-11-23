import {
  MIN_QUOTES,
  type PaymentMethod,
  type PurchaseQuote,
} from "@/shared/contracts/purchase-quotes";
import { formatCents } from "@/shared/lib/format";

/** The payment methods, in the order the select shows them. */
export const PAYMENT_METHODS: PaymentMethod[] = [
  "PIX",
  "CASH",
  "DEBIT_CARD",
  "CREDIT_CARD",
  "BOLETO",
  "BANK_TRANSFER",
  "INVOICE",
  "OTHER",
];

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  PIX: "PIX",
  CASH: "Dinheiro",
  DEBIT_CARD: "Cartão de débito",
  CREDIT_CARD: "Cartão de crédito",
  BOLETO: "Boleto",
  BANK_TRANSFER: "Transferência (TED)",
  INVOICE: "Faturado",
  OTHER: "Outro",
};

/** "5%", "2,5%" from basis points. */
export const percentLabel = (bp: number) =>
  `${(bp / 100).toLocaleString("pt-BR", { maximumFractionDigits: 2 })}%`;

/** What a quote's other charges usually are (or typed: "Outro (digitar)"). */
export const CHARGE_LABELS = [
  "Instalação",
  "Mão de obra",
  "Montagem",
  "Taxa de serviço",
  "Taxa de entrega urgente",
  "Embalagem",
  "Seguro",
  "Impostos",
] as const;

/** The methods that may be split into installments (as the API). */
export const INSTALLMENT_METHODS: PaymentMethod[] = [
  "CREDIT_CARD",
  "BOLETO",
  "INVOICE",
  "OTHER",
];

export const MAX_INSTALLMENTS = 60;

/** The total split in installments, the last taking the cents left. */
export function installmentCents(totalCents: number, count: number) {
  const part = Math.floor(totalCents / count);
  return Array.from({ length: count }, (_, index) =>
    index === count - 1 ? totalCents - part * (count - 1) : part,
  );
}

/** Interest: up to 20% a month, in basis points (as the API). */
export const MAX_INTEREST_BP = 2000;

/**
 * Mirrors the API: without interest, equal parts (the last taking the cents
 * left); with a monthly rate, the Price table (equal installments, compound
 * interest), each rounded to the cent.
 */
export function installmentPlan(
  cashCents: number,
  count: number,
  interestRateBp: number | null,
): number[] {
  if (!interestRateBp) return installmentCents(cashCents, count);
  const rate = interestRateBp / 10_000;
  const payment = Math.round((cashCents * rate) / (1 - (1 + rate) ** -count));
  return Array.from({ length: count }, () => payment);
}

/** "1,99% a.m." from basis points. */
export const interestLabel = (bp: number) =>
  `${(bp / 100).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}% a.m.`;

/** How a quote is paid, as a line (null: not said). */
export function paymentLine(
  quote: Pick<
    PurchaseQuote,
    | "paymentMethod"
    | "installments"
    | "paymentTerms"
    | "installmentValues"
    | "interestRateBp"
  >,
): string | null {
  if (!quote.paymentMethod) return null;
  const method =
    quote.paymentMethod === "OTHER"
      ? (quote.paymentTerms ?? PAYMENT_METHOD_LABELS.OTHER)
      : PAYMENT_METHOD_LABELS[quote.paymentMethod];
  const parts = quote.installmentValues;
  if (!quote.installments || parts.length === 0) return `${method} · à vista`;
  const last = parts[parts.length - 1];
  const split =
    last === parts[0]
      ? `${parts.length}x de ${formatCents(parts[0])}`
      : `${parts.length}x de ${formatCents(parts[0])} (última de ${formatCents(last)})`;
  return `${method} · ${split} ${quote.interestRateBp ? `com juros de ${interestLabel(quote.interestRateBp)}` : "sem juros"}`;
}

/** "Imediato", "1 dia", "5 dias" (null: not said). */
export const deliveryLabel = (days: number | null) =>
  days === null
    ? null
    : days === 0
      ? "Imediato"
      : days === 1
        ? "1 dia"
        : `${days} dias`;

/**
 * Mirrors the API: choosing a quote needs a justification when it isn't
 * the cheapest complete one or there are fewer than MIN_QUOTES quotes.
 */
export const choiceNeedsJustification = (
  quote: Pick<PurchaseQuote, "cheapest">,
  total: number,
) => total < MIN_QUOTES || !quote.cheapest;

/** Why it needs a justification, in a sentence (null: it doesn't). */
export function justificationReason(
  quote: Pick<PurchaseQuote, "cheapest" | "complete">,
  total: number,
): string | null {
  if (!quote.cheapest) {
    return quote.complete
      ? "Esta não é a cotação completa mais barata."
      : "Esta cotação não tem preço para todos os itens.";
  }
  if (total < MIN_QUOTES) {
    return `Há ${total === 1 ? "só 1 cotação" : `só ${total} cotações`} (o recomendado são ${MIN_QUOTES}).`;
  }
  return null;
}

/** The lowest line total of each item among the quotes (null: none). */
export function lowestLines(quotes: PurchaseQuote[], items: number) {
  return Array.from({ length: items }, (_, index) => {
    const values = quotes
      .map((quote) => quote.lines[index]?.lineCents)
      .filter(
        (value): value is number => value !== null && value !== undefined,
      );
    return values.length ? Math.min(...values) : null;
  });
}
