import type { PurchaseQuote } from "@/shared/contracts/purchase-quotes";

/** A quote and its place in the map (1 = the cheapest complete one). */
export type RankedQuote = { quote: PurchaseQuote; rank: number };

/**
 * The quotes as the map shows them: complete ones first, each group by its
 * total (lowest first). Partial quotes can't win on price, so they go last.
 */
export function rankQuotes(quotes: PurchaseQuote[]): RankedQuote[] {
  return [...quotes]
    .sort(
      (a, b) =>
        Number(b.complete) - Number(a.complete) || a.totalCents - b.totalCents,
    )
    .map((quote, index) => ({ quote, rank: index + 1 }));
}

/** What the map's summary says at a glance. */
export type QuoteInsights = {
  /** The cheapest complete quote (null: none is complete). */
  cheapest: PurchaseQuote | null;
  /** What the cheapest saves against the dearest complete one. */
  savingsCents: number;
  /** The quickest delivery (null: no quote says it). */
  fastest: PurchaseQuote | null;
  completeCount: number;
};

export function quoteInsights(quotes: PurchaseQuote[]): QuoteInsights {
  const complete = quotes.filter((quote) => quote.complete);
  const totals = complete.map((quote) => quote.totalCents);
  const cheapest =
    complete.reduce<PurchaseQuote | null>(
      (best, quote) =>
        !best || quote.totalCents < best.totalCents ? quote : best,
      null,
    ) ?? null;
  const fastest = quotes.reduce<PurchaseQuote | null>(
    (best, quote) =>
      quote.deliveryDays !== null &&
      (!best ||
        best.deliveryDays === null ||
        quote.deliveryDays < best.deliveryDays)
        ? quote
        : best,
    null,
  );
  return {
    cheapest,
    savingsCents: totals.length ? Math.max(...totals) - Math.min(...totals) : 0,
    fastest,
    completeCount: complete.length,
  };
}

/** How many of the request's items the quote priced. */
export const pricedCount = (quote: PurchaseQuote) =>
  quote.lines.filter((line) => line.lineCents !== null).length;
