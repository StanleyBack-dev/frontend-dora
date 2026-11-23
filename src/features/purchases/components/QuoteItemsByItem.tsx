import { Check } from "lucide-react";
import { cn } from "@/design-system";
import type { RankedQuote } from "@/features/purchases/model/quote-ranking";
import { formatQuantity } from "@/features/purchases/model/request-labels";
import type { PurchaseRequest } from "@/shared/contracts/purchase-requests";
import { formatCents } from "@/shared/lib/format";

// On phones, the price comparison one item at a time: the suppliers from
// the lowest price to the highest, the lowest in green; who didn't quote
// it comes last.
export function QuoteItemsByItem({
  request,
  ranked,
  lowest,
}: {
  request: PurchaseRequest;
  ranked: RankedQuote[];
  lowest: (number | null)[];
}) {
  return (
    <ol className="space-y-3">
      {request.items.map((item, index) => {
        const offers = ranked
          .map(({ quote }) => ({ quote, line: quote.lines[index] }))
          .sort(
            (a, b) =>
              (a.line?.lineCents ?? Infinity) - (b.line?.lineCents ?? Infinity),
          );
        return (
          <li
            key={item.id}
            className="overflow-hidden rounded-2xl border border-border bg-surface"
          >
            <div className="flex items-baseline justify-between gap-3 bg-surface-muted px-3 py-2.5">
              <span className="min-w-0 font-semibold break-words text-fg">
                {item.productName}
                {item.brandName && (
                  <span className="font-normal text-soft">
                    {" "}
                    · {item.brandName}
                  </span>
                )}
              </span>
              <span className="shrink-0 text-xs text-muted">
                {formatQuantity(item.quantity, item.unit)}
              </span>
            </div>
            <ul className="divide-y divide-border text-[13px]">
              {offers.map(({ quote, line }) => {
                const priced =
                  line &&
                  line.lineCents !== null &&
                  line.unitPriceCents !== null;
                const best = priced && line.lineCents === lowest[index];
                return (
                  <li
                    key={quote.id}
                    className={cn(
                      "flex items-center justify-between gap-3 px-3 py-2",
                      best && "bg-success-soft",
                    )}
                  >
                    <span
                      className={cn(
                        "flex min-w-0 items-center gap-1.5 break-words",
                        priced ? "text-fg" : "text-soft",
                      )}
                    >
                      {best && (
                        <Check
                          aria-label="Menor preço"
                          className="size-4 shrink-0 text-success"
                        />
                      )}
                      {quote.supplierName}
                    </span>
                    {priced ? (
                      <span className="shrink-0 text-right tabular-nums">
                        <span
                          className={cn(
                            "block font-semibold",
                            best ? "text-success" : "text-fg",
                          )}
                        >
                          {formatCents(line.lineCents!)}
                        </span>
                        <span className="text-[11px] text-soft">
                          {formatCents(line.unitPriceCents!)} / un.
                        </span>
                      </span>
                    ) : (
                      <span className="shrink-0 text-xs text-soft italic">
                        Não cotou
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>
          </li>
        );
      })}
    </ol>
  );
}
