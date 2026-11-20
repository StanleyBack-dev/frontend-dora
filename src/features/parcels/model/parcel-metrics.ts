/** "18 h" or "2,5 dias" (— when nothing was picked up). */
export function pickupTime(hours: number | null): string {
  if (hours === null) return "—";
  if (hours < 48) return `${hours.toLocaleString("pt-BR")} h`;
  return `${(hours / 24).toLocaleString("pt-BR", { maximumFractionDigits: 1 })} dias`;
}

/** "2 já retiradas" (undefined: none, so the tooltip stays short). */
export const pickedUpNote = (count: number) =>
  count === 0
    ? undefined
    : `${count.toLocaleString("pt-BR")} já retirada${count === 1 ? "" : "s"}`;
