import {
  interestLabel,
  percentLabel,
} from "@/features/purchases/model/quote-labels";
import type { PurchaseQuote } from "@/shared/contracts/purchase-quotes";
import { formatCents } from "@/shared/lib/format";

/** One line of how a quote reaches its total. */
export type BreakdownLine = {
  label: string;
  /** The amount as shown ("R$ 12,00", "− R$ 5,00"; null: none). */
  value: string | null;
  /** Small text under it (each charge). */
  detail?: string;
  tone?: "good" | "bad";
};

/**
 * Items, shipping, charges, discount and interest, in the order they add
 * up. The total is shown apart.
 */
export function quoteBreakdown(quote: PurchaseQuote): BreakdownLine[] {
  return [
    { label: "Itens", value: formatCents(quote.itemsCents) },
    {
      label: "Frete",
      value: quote.shippingCents ? formatCents(quote.shippingCents) : null,
    },
    {
      label: "Encargos",
      value: quote.chargesCents ? formatCents(quote.chargesCents) : null,
      detail: quote.charges.length
        ? quote.charges
            .map(
              (charge) => `${charge.label}: ${formatCents(charge.amountCents)}`,
            )
            .join(" · ")
        : undefined,
    },
    {
      label: "Desconto",
      value: quote.discountCents
        ? `− ${formatCents(quote.discountCents)}`
        : null,
      detail:
        quote.discountCents && quote.discountPercentBp
          ? `${percentLabel(quote.discountPercentBp)} sobre o valor`
          : undefined,
      tone: "good",
    },
    {
      label: "Juros",
      value: quote.interestCents
        ? `+ ${formatCents(quote.interestCents)}`
        : null,
      detail:
        quote.interestCents && quote.interestRateBp
          ? interestLabel(quote.interestRateBp)
          : undefined,
      tone: "bad",
    },
  ];
}
