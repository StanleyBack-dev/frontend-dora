import type { MetricsGranularity } from "@/shared/contracts/platform-metrics";

const DAY_MS = 86_400_000;
const toUtc = (date: string) => Date.parse(`${date}T00:00:00Z`);
const fromUtc = (ms: number) => new Date(ms).toISOString().slice(0, 10);

/** Quick periods above the filters, ending today. */
export const PERIOD_PRESETS = [
  { days: 7, label: "7 dias" },
  { days: 30, label: "30 dias" },
  { days: 90, label: "90 dias" },
  { days: 365, label: "12 meses" },
] as const;

/** First day of a period of `days` days ending on `to` (both included). */
export const periodStart = (to: string, days: number): string =>
  fromUtc(toUtc(to) - (days - 1) * DAY_MS);

const dayMonth = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  timeZone: "UTC",
});
const monthYear = new Intl.DateTimeFormat("pt-BR", {
  month: "short",
  year: "2-digit",
  timeZone: "UTC",
});
const fullDay = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

/** "14/11", "sem. 10/11", "nov. 26": a bucket on the axis. */
export function bucketLabel(
  bucket: string,
  granularity: MetricsGranularity,
): string {
  const date = new Date(toUtc(bucket));
  if (granularity === "MONTH")
    return monthYear.format(date).replace(" de ", " ");
  return dayMonth.format(date);
}

/** The bucket in full, for the tooltip and the table. */
export function bucketTitle(
  bucket: string,
  granularity: MetricsGranularity,
): string {
  const date = new Date(toUtc(bucket));
  if (granularity === "DAY") return fullDay.format(date);
  if (granularity === "WEEK") return `Semana de ${fullDay.format(date)}`;
  return new Intl.DateTimeFormat("pt-BR", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

/** "14 de novembro de 2026": a period end in the header. */
export const formatPeriodDay = (date: string) =>
  fullDay.format(new Date(toUtc(date)));

export const WEEKDAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
export const WEEKDAY_NAMES = [
  "Domingo",
  "Segunda-feira",
  "Terça-feira",
  "Quarta-feira",
  "Quinta-feira",
  "Sexta-feira",
  "Sábado",
];

/** "19h" on the axis, "19h–20h" in the tooltip. */
export const hourLabel = (hour: number) => `${hour}h`;
export const hourTitle = (hour: number) => `Das ${hour}h às ${hour + 1}h`;

/** "12,5%" of `part` in `whole` (0 when there is nothing). */
export function percent(part: number, whole: number): string {
  if (whole === 0) return "0%";
  return `${new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 1 }).format(
    (part / whole) * 100,
  )}%`;
}
