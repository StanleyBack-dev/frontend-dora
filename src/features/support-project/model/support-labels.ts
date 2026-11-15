/** What the ranking shows for someone who chose not to show the name. */
export const ANONYMOUS_SUPPORTER = "Apoiador anônimo";

/** "1 apoio", "3 apoios". */
export const contributionsLabel = (count: number) =>
  `${count} ${count === 1 ? "apoio" : "apoios"}`;

/** Podium colors for the first three places; the rest are plain. */
export function podiumClasses(position: number): string {
  switch (position) {
    case 1:
      return "bg-brand text-brand-fg";
    case 2:
      return "bg-warning-soft text-warning";
    case 3:
      return "bg-brand-soft text-brand-ink";
    default:
      return "bg-surface-muted text-muted";
  }
}

/** Ranking period in the address: all time or the current year. */
export type RankingPeriod = "geral" | "ano";
