import { formatCents } from "@/shared/lib/format";

/** "1ª", "2ª"… */
const ordinal = (index: number) => `${index + 1}ª`;

/**
 * Each installment and its value, as a short list that scrolls when long
 * (up to 60x). Renders nothing for a payment at once.
 */
export function InstallmentSchedule({ values }: { values: number[] }) {
  if (values.length < 2) return null;
  return (
    <ol
      aria-label="Parcelas"
      className="max-h-48 overflow-y-auto rounded-lg border border-border bg-surface text-[13px]"
    >
      {values.map((value, index) => (
        <li
          key={index}
          className="flex justify-between gap-3 border-b border-border px-3 py-1.5 last:border-b-0"
        >
          <span className="text-muted">{ordinal(index)} parcela</span>
          <span className="font-medium text-fg">{formatCents(value)}</span>
        </li>
      ))}
    </ol>
  );
}
