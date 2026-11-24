import { Check } from "lucide-react";
import { cn } from "@/design-system";
import { quoteBreakdown } from "@/features/purchases/model/quote-breakdown";
import type { RankedQuote } from "@/features/purchases/model/quote-ranking";
import { formatQuantity } from "@/features/purchases/model/request-labels";
import type { PurchaseRequest } from "@/shared/contracts/purchase-requests";
import { formatCents } from "@/shared/lib/format";

/**
 * From sm up: the items in rows and the suppliers in columns (in the map's
 * order), the lowest price of each item in a green chip; then how each
 * total is made up and the total itself. The item column stays put while
 * the suppliers scroll sideways.
 */
export function QuoteItemsTable({
  request,
  ranked,
  lowest,
}: {
  request: PurchaseRequest;
  ranked: RankedQuote[];
  /** The lowest line total of each item (null: none quoted it). */
  lowest: (number | null)[];
}) {
  const breakdowns = ranked.map(({ quote }) => quoteBreakdown(quote));
  const sticky =
    "sticky left-0 z-10 border-r border-border bg-surface text-left";

  return (
    <div className="overflow-x-auto rounded-2xl border border-border">
      <table className="w-full min-w-[640px] border-separate border-spacing-0 text-[13px]">
        <thead>
          <tr className="bg-surface-muted">
            <th
              className={cn(
                sticky,
                "w-56 bg-surface-muted px-3 py-2.5 text-[11px] font-semibold tracking-wide text-soft uppercase",
              )}
            >
              Item
            </th>
            {ranked.map(({ quote, rank }) => (
              <th
                key={quote.id}
                className={cn(
                  "min-w-40 border-b-2 px-3 py-2.5 text-right align-bottom",
                  quote.chosen
                    ? "border-brand bg-brand-soft"
                    : quote.cheapest
                      ? "border-success"
                      : "border-border",
                )}
              >
                <span className="block text-[11px] font-semibold text-soft">
                  {rank}º
                </span>
                <span className="block font-semibold break-words text-fg">
                  {quote.supplierName}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {request.items.map((item, index) => (
            <tr key={item.id} className="align-top">
              <th
                scope="row"
                className={cn(sticky, "border-b px-3 py-2.5 font-normal")}
              >
                <span className="block font-medium text-fg">
                  {item.productName}
                </span>
                <span className="text-xs text-soft">
                  {formatQuantity(item.quantity, item.unit)}
                  {item.brandName ? ` · ${item.brandName}` : ""}
                </span>
              </th>
              {ranked.map(({ quote }) => {
                const line = quote.lines[index];
                const priced =
                  line &&
                  line.lineCents !== null &&
                  line.unitPriceCents !== null;
                const best = priced && line.lineCents === lowest[index];
                return (
                  <td
                    key={quote.id}
                    className={cn(
                      "border-b border-border px-3 py-2.5 text-right",
                      quote.chosen && "bg-brand-soft/40",
                    )}
                  >
                    {priced ? (
                      <>
                        <span
                          className={cn(
                            "inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 font-semibold tabular-nums",
                            best ? "bg-success-soft text-success" : "text-fg",
                          )}
                        >
                          {best && <Check aria-hidden className="size-3.5" />}
                          {formatCents(line.lineCents!)}
                        </span>
                        <span className="block text-xs text-soft tabular-nums">
                          {formatCents(line.unitPriceCents!)} / un.
                        </span>
                      </>
                    ) : (
                      <span className="text-xs text-soft italic">
                        Não cotou
                      </span>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}

          {breakdowns[0]?.map((first, row) => (
            <tr key={first.label} className="align-top text-muted">
              <th
                scope="row"
                className={cn(
                  sticky,
                  "border-b bg-surface-muted/60 px-3 py-2 text-xs font-medium",
                )}
              >
                {row === 0 ? "Subtotal dos itens" : first.label}
              </th>
              {ranked.map(({ quote }, at) => {
                const line = breakdowns[at][row];
                return (
                  <td
                    key={quote.id}
                    className={cn(
                      "border-b border-border bg-surface-muted/60 px-3 py-2 text-right tabular-nums",
                      line.value &&
                        (line.tone === "good"
                          ? "text-success"
                          : line.tone === "bad"
                            ? "text-danger"
                            : "text-fg"),
                    )}
                  >
                    {line.value ?? "—"}
                    {line.detail && (
                      <span className="block text-[11px] text-soft">
                        {line.detail}
                      </span>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}

          <tr>
            <th
              scope="row"
              className={cn(
                sticky,
                "rounded-bl-2xl bg-surface px-3 py-3 font-semibold text-fg",
              )}
            >
              Total
            </th>
            {ranked.map(({ quote }) => (
              <td
                key={quote.id}
                className={cn(
                  "px-3 py-3 text-right",
                  quote.chosen && "bg-brand-soft/40",
                )}
              >
                <span
                  className={cn(
                    "text-base font-extrabold tabular-nums",
                    quote.cheapest ? "text-success" : "text-fg",
                  )}
                >
                  {formatCents(quote.totalCents)}
                </span>
                {quote.interestCents > 0 && (
                  <span className="block text-[11px] text-soft">
                    {formatCents(quote.cashCents)} à vista
                  </span>
                )}
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
}
