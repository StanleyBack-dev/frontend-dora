import { formatNumber } from "@/shared/lib/format";

export type RankItem = {
  key: string;
  name: string;
  /** Second line ("Jardins Itália", "12 h reservadas"). */
  hint?: string;
  value: number;
  /** Text after the value ("2 canceladas"). */
  note?: string;
};

// A ranking as horizontal bars from one baseline: the name above, a thin
// orange bar, the value in text at its tip. Every row is labelled, so the
// list reads without hovering (and works as its own table).
export function RankBars({
  items,
  emptyText,
}: {
  items: RankItem[];
  emptyText: string;
}) {
  const max = Math.max(0, ...items.map((item) => item.value));
  if (items.length === 0 || max === 0) {
    return (
      <p className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted">
        {emptyText}
      </p>
    );
  }
  return (
    <ol className="space-y-3">
      {items.map((item, index) => (
        <li key={item.key} className="min-w-0">
          <div className="flex items-baseline justify-between gap-3 text-sm">
            <p className="min-w-0 truncate text-fg">
              <span className="mr-1.5 text-xs text-soft tabular-nums">
                {index + 1}.
              </span>
              <span className="font-medium">{item.name}</span>
              {item.hint && (
                <span className="ml-1.5 text-xs text-muted">{item.hint}</span>
              )}
            </p>
            <p className="shrink-0 text-right text-fg tabular-nums">
              <span className="font-semibold">{formatNumber(item.value)}</span>
              {item.note && (
                <span className="ml-1.5 text-xs text-muted">{item.note}</span>
              )}
            </p>
          </div>
          <div aria-hidden className="mt-1.5 h-2 rounded-full bg-surface-muted">
            <div
              className="h-full rounded-full bg-brand"
              style={{ width: `${Math.max(2, (item.value / max) * 100)}%` }}
            />
          </div>
        </li>
      ))}
    </ol>
  );
}
