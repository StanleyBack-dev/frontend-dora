import { requestCode } from "@/features/purchases/model/request-labels";
import type { PurchaseQuote } from "@/shared/contracts/purchase-quotes";
import type { PurchaseRequest } from "@/shared/contracts/purchase-requests";
import { formatCents } from "@/shared/lib/format";

/** At most this many e-mails per send (as the API). */
export const MAX_SHARE_EMAILS = 5;
export const MAX_SHARE_MESSAGE = 1000;

/** The map's file name (as the API names it). */
export const quoteMapFileName = (request: Pick<PurchaseRequest, "number">) =>
  `mapa-de-cotacao-${requestCode(request.number)}.pdf`;

/**
 * The default message sent with the map: what it is, how many quotes,
 * the cheapest and the chosen one. The person may change it.
 */
export function quoteShareMessage(
  request: Pick<PurchaseRequest, "number" | "title">,
  quotes: PurchaseQuote[],
): string {
  const complete = quotes.filter((quote) => quote.complete).length;
  const cheapest = quotes.find((quote) => quote.cheapest);
  const chosen = quotes.find((quote) => quote.chosen);
  const line = (quote: PurchaseQuote) =>
    `${quote.supplierName} · ${formatCents(quote.totalCents)}`;
  return [
    `Olá! Segue o mapa de cotação da solicitação ${requestCode(request.number)} · ${request.title}.`,
    "",
    `• ${quotes.length} ${quotes.length === 1 ? "cotação" : "cotações"} (${complete} ${complete === 1 ? "completa" : "completas"})`,
    cheapest ? `• Menor total: ${line(cheapest)}` : null,
    chosen ? `• Escolhida: ${line(chosen)}` : null,
    "",
    "O PDF em anexo tem a comparação completa, item a item.",
  ]
    .filter((part): part is string => part !== null)
    .join("\n");
}

export const isEmail = (value: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);
