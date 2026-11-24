import { cn } from "@/design-system/utils/cn";

export type BarListItem = {
  key: string;
  label: string;
  /** Sizes the bar (relative to the largest). */
  value: number;
  /** The value as shown ("R$ 129,00"). */
  valueLabel: string;
  /** A second line under the label ("2 compras · 4,0 de 5"). */
  hint?: string;
};

// Amounts compared side by side as thin horizontal bars (one hue, the
// brand's): each row names the item and prints its value, so the list reads
// as a table too; the bar only sizes it against the largest.
export function BarList({
  items,
  label,
  empty = "Nada no período.",
  className,
}: {
  items: BarListItem[];
  /** What the list shows, for screen readers. */
  label: string;
  empty?: string;
  className?: string;
}) {
  if (items.length === 0) {
    return <p className={cn("text-sm text-muted", className)}>{empty}</p>;
  }
  const top = Math.max(...items.map((item) => item.value), 0);
  return (
    <ul aria-label={label} className={cn("space-y-3", className)}>
      {items.map((item) => {
        const share = top > 0 ? item.value / top : 0;
        return (
          <li key={item.key} className="min-w-0">
            <div className="flex items-baseline justify-between gap-3 text-sm">
              <span className="min-w-0 truncate text-fg" title={item.label}>
                {item.label}
              </span>
              <span className="shrink-0 font-medium text-fg tabular-nums">
                {item.valueLabel}
              </span>
            </div>
            {item.hint && (
              <p className="truncate text-xs text-muted">{item.hint}</p>
            )}
            <div
              aria-hidden
              className="mt-1.5 h-2 rounded-full bg-surface-muted"
            >
              {share > 0 && (
                <div
                  className="h-2 rounded-full bg-brand"
                  style={{ width: `max(${share * 100}%, 4px)` }}
                />
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
