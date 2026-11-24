import { cn } from "@/design-system/utils/cn";

export type ColumnChartItem = {
  key: string;
  /** Under the column ("jan"). */
  label: string;
  /** In the tooltip and for screen readers ("Janeiro de 2026"). */
  fullLabel: string;
  value: number;
  /** The value as shown ("R$ 129,00"). */
  valueLabel: string;
};

// A series over time as columns (one hue, the brand's) from one baseline:
// thin columns with a rounded top, a recessive top line with the largest
// value, and each column's value in a tooltip on hover or focus (a tap).
// `highlight` keeps one column strong and mutes the others (a month picked
// in a year).
export function ColumnChart({
  items,
  label,
  highlight,
  empty = "Nada no período.",
  className,
}: {
  items: ColumnChartItem[];
  /** What the chart shows, for screen readers. */
  label: string;
  highlight?: string | null;
  /** Over the empty plot when every value is zero. */
  empty?: string;
  className?: string;
}) {
  const top = Math.max(...items.map((item) => item.value), 0);
  const topItem = items.find((item) => item.value === top && top > 0);
  return (
    <figure aria-label={label} className={cn("min-w-0", className)}>
      <div className="relative">
        <p className="text-xs text-soft tabular-nums">
          {topItem ? topItem.valueLabel : " "}
        </p>
        {!topItem && (
          <p className="absolute inset-x-0 top-1/2 -translate-y-1/2 text-center text-sm text-muted">
            {empty}
          </p>
        )}
        <ul className="relative mt-1 flex h-40 items-end gap-0.5 border-t border-dashed border-border sm:gap-1">
          {items.map((item, index) => {
            const share = top > 0 ? item.value / top : 0;
            const muted = Boolean(highlight) && highlight !== item.key;
            // At the ends the tooltip lines up with the edge, not centred,
            // so it stays inside the card.
            const edge =
              index < 2
                ? "left-0"
                : index >= items.length - 2
                  ? "right-0"
                  : "left-1/2 -translate-x-1/2";
            return (
              <li
                key={item.key}
                tabIndex={0}
                aria-label={`${item.fullLabel}: ${item.valueLabel}`}
                className="group relative flex h-full flex-1 cursor-default items-end justify-center rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {share > 0 && (
                  <span
                    aria-hidden
                    className={cn(
                      "w-full max-w-6 rounded-t-[4px] transition-opacity",
                      muted ? "bg-brand/30" : "bg-brand",
                    )}
                    style={{ height: `max(${share * 100}%, 3px)` }}
                  />
                )}
                <span
                  role="tooltip"
                  className={cn(
                    "pointer-events-none absolute bottom-full z-10 mb-1 hidden rounded-lg bg-chrome px-2 py-1 text-center text-xs whitespace-nowrap text-chrome-fg shadow-card group-hover:block group-focus:block",
                    edge,
                  )}
                >
                  <span className="block text-chrome-muted">
                    {item.fullLabel}
                  </span>
                  <span className="font-medium tabular-nums">
                    {item.valueLabel}
                  </span>
                </span>
              </li>
            );
          })}
        </ul>
        <div aria-hidden className="h-px bg-border" />
        <ul aria-hidden className="mt-1 flex gap-0.5 sm:gap-1">
          {items.map((item) => (
            <li
              key={item.key}
              className={cn(
                "flex-1 text-center text-[11px] text-soft",
                highlight === item.key && "font-semibold text-fg",
              )}
            >
              {item.label}
            </li>
          ))}
        </ul>
      </div>
    </figure>
  );
}
