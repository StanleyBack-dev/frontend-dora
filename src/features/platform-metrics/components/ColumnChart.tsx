"use client";

import { useId, useState } from "react";
import { BarChart3, Table2 } from "lucide-react";
import { cn } from "@/design-system";
import { formatNumber } from "@/shared/lib/format";

export type ColumnPoint = {
  key: string;
  /** Short text under the column ("14/11", "Seg"). */
  axis: string;
  /** Full text in the tooltip and the table ("14 de novembro de 2026"). */
  title: string;
  value: number;
  /** Extra line in the tooltip and a table column ("2 canceladas"). */
  detail?: string;
};

type Props = {
  /** What the chart shows, for screen readers and the table caption. */
  label: string;
  points: ColumnPoint[];
  /** "reserva" / "reservas". */
  unit: [singular: string, plural: string];
  /** Column header of the detail in the table view. */
  detailLabel?: string;
  /** At most this many labels on the axis (the rest only on hover). */
  maxAxisLabels?: number;
  emptyText?: string;
};

/** Clean top of the scale: 1, 2, 5 × 10ⁿ at or above the maximum. */
function niceMax(value: number): number {
  if (value <= 0) return 1;
  const power = 10 ** Math.floor(Math.log10(value));
  const step = [1, 2, 5, 10].find((n) => n * power >= value) ?? 10;
  return step * power;
}

// One series of columns from a single baseline (the app's orange): thin
// columns with a rounded top, recessive gridlines, only the peak labelled,
// a tooltip on hover or keyboard focus, and the same numbers as a table.
export function ColumnChart({
  label,
  points,
  unit,
  detailLabel,
  maxAxisLabels = 8,
  emptyText = "Nada no período.",
}: Props) {
  const id = useId();
  const [active, setActive] = useState<number | null>(null);
  const [asTable, setAsTable] = useState(false);
  const max = Math.max(0, ...points.map((point) => point.value));
  const top = niceMax(max);
  const peak = max > 0 ? points.findIndex((point) => point.value === max) : -1;
  const step = Math.max(1, Math.ceil(points.length / maxAxisLabels));
  const count = (value: number) =>
    `${formatNumber(value)} ${value === 1 ? unit[0] : unit[1]}`;

  const toggle = (
    <button
      type="button"
      onClick={() => setAsTable((value) => !value)}
      aria-pressed={asTable}
      className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-muted transition-colors hover:bg-surface-muted hover:text-fg"
    >
      {asTable ? (
        <BarChart3 aria-hidden className="size-3.5" />
      ) : (
        <Table2 aria-hidden className="size-3.5" />
      )}
      {asTable ? "Ver gráfico" : "Ver tabela"}
    </button>
  );

  if (max === 0) {
    return (
      <p className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted">
        {emptyText}
      </p>
    );
  }

  if (asTable) {
    return (
      <div>
        <div className="mb-2 flex justify-end">{toggle}</div>
        <div className="max-h-72 overflow-auto rounded-lg border border-border">
          <table className="w-full text-sm">
            <caption className="sr-only">{label}</caption>
            <thead className="sticky top-0 bg-surface-muted text-left text-xs text-muted">
              <tr>
                <th className="px-3 py-2 font-medium">Período</th>
                <th className="px-3 py-2 text-right font-medium">Total</th>
                {detailLabel && (
                  <th className="px-3 py-2 text-right font-medium">
                    {detailLabel}
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {points.map((point) => (
                <tr key={point.key}>
                  <td className="px-3 py-1.5 text-fg">{point.title}</td>
                  <td className="px-3 py-1.5 text-right text-fg tabular-nums">
                    {formatNumber(point.value)}
                  </td>
                  {detailLabel && (
                    <td className="px-3 py-1.5 text-right text-muted tabular-nums">
                      {point.detail ?? "—"}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  const shown = active !== null ? points[active] : null;
  return (
    <div>
      <div className="mb-2 flex justify-end">{toggle}</div>
      <div className="mt-4 flex gap-2">
        {/* Y axis: 0, half and the clean top. */}
        <div
          aria-hidden
          className="flex h-40 w-7 shrink-0 flex-col justify-between text-right text-[10px] text-soft tabular-nums"
        >
          <span className="-translate-y-1/2">{formatNumber(top)}</span>
          {/* Counts are whole numbers: no "0,5" tick. */}
          <span>{Number.isInteger(top / 2) ? formatNumber(top / 2) : ""}</span>
          <span className="translate-y-1/2">0</span>
        </div>
        <div className="relative min-w-0 flex-1">
          {/* Gridlines: hairlines, one step off the surface. */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 flex h-40 flex-col justify-between"
          >
            <span className="border-t border-border" />
            <span className="border-t border-border" />
            <span className="border-t border-border-strong" />
          </div>

          <ul
            aria-label={label}
            className="relative flex h-40 items-end"
            onMouseLeave={() => setActive(null)}
          >
            {points.map((point, index) => {
              const height = (point.value / top) * 100;
              const dimmed = active !== null && active !== index;
              return (
                <li key={point.key} className="flex h-full min-w-0 flex-1">
                  {/* The hit target is the whole column, not just the bar. */}
                  <button
                    type="button"
                    aria-label={`${point.title}: ${count(point.value)}${point.detail ? `, ${point.detail}` : ""}`}
                    aria-describedby={
                      active === index ? `${id}-tip` : undefined
                    }
                    onMouseEnter={() => setActive(index)}
                    onFocus={() => setActive(index)}
                    onBlur={() => setActive(null)}
                    className="group relative flex h-full w-full items-end justify-center rounded-sm outline-none focus-visible:bg-surface-muted"
                  >
                    {index === peak && active === null && (
                      <span
                        aria-hidden
                        className="absolute left-1/2 -translate-x-1/2 text-[10px] font-semibold text-fg tabular-nums"
                        style={{ bottom: `calc(${height}% + 2px)` }}
                      >
                        {formatNumber(point.value)}
                      </span>
                    )}
                    <span
                      aria-hidden
                      className={cn(
                        "block w-[70%] max-w-6 rounded-t-[4px] bg-brand transition-opacity",
                        dimmed && "opacity-40",
                      )}
                      style={{
                        height: `${height}%`,
                        minHeight: point.value > 0 ? 2 : 0,
                      }}
                    />
                  </button>
                </li>
              );
            })}
          </ul>

          {shown && active !== null && (
            <div
              id={`${id}-tip`}
              role="tooltip"
              className="pointer-events-none absolute -top-2 z-10 w-max max-w-56 -translate-y-full rounded-lg border border-border bg-surface px-3 py-2 text-xs shadow-pop"
              style={tipPosition(active, points.length)}
            >
              <p className="font-semibold text-fg">{shown.title}</p>
              <p className="flex items-center gap-1.5 text-fg tabular-nums">
                <span aria-hidden className="size-2 rounded-sm bg-brand" />
                {count(shown.value)}
              </p>
              {shown.detail && <p className="text-muted">{shown.detail}</p>}
            </div>
          )}

          {/* X axis: every n-th label, centred under its column and free
              to be wider than it (the step leaves room between them). */}
          <div aria-hidden className="mt-1.5 flex h-3.5">
            {points.map((point, index) => (
              <span key={point.key} className="relative min-w-0 flex-1">
                {index % step === 0 && (
                  <span className="absolute left-1/2 -translate-x-1/2 text-[10px] whitespace-nowrap text-soft">
                    {point.axis}
                  </span>
                )}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/** Keeps the tooltip inside the chart at both ends. */
function tipPosition(index: number, total: number) {
  const center = ((index + 0.5) / total) * 100;
  if (center < 20) return { left: 0 };
  if (center > 80) return { right: 0 };
  // `translate` (not transform): Tailwind v4's translate classes use that
  // property, so this replaces the class's offset instead of adding to it.
  return { left: `${center}%`, translate: "-50% -100%" };
}
