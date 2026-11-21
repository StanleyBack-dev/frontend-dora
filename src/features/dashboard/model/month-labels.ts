/** "nov" from "2026-11" (the month's short name, a chart's axis). */
export const monthLabel = (month: string) =>
  new Intl.DateTimeFormat("pt-BR", { month: "short", timeZone: "UTC" })
    .format(new Date(`${month}-01T12:00:00Z`))
    .replace(".", "");

/** "novembro de 2026" from "2026-11". */
export const monthTitle = (month: string) =>
  new Intl.DateTimeFormat("pt-BR", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${month}-01T12:00:00Z`));
