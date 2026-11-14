import {
  Dumbbell,
  Flame,
  Gamepad2,
  LandPlot,
  MapPin,
  PartyPopper,
  Waves,
  type LucideIcon,
} from "lucide-react";
import type {
  LimitPeriod,
  OpeningHours,
  SpaceKind,
  SpaceRules,
} from "@/shared/contracts/spaces";

export const SPACE_KINDS: Record<
  SpaceKind,
  { label: string; icon: LucideIcon }
> = {
  COURT: { label: "Quadra", icon: LandPlot },
  PARTY_ROOM: { label: "Salão de festas", icon: PartyPopper },
  BARBECUE: { label: "Churrasqueira", icon: Flame },
  POOL: { label: "Piscina", icon: Waves },
  GYM: { label: "Academia", icon: Dumbbell },
  GAME_ROOM: { label: "Salão de jogos", icon: Gamepad2 },
  OTHER: { label: "Outro espaço", icon: MapPin },
};

export const SPACE_KIND_ORDER = Object.keys(SPACE_KINDS) as SpaceKind[];

/** Monday first, as people read a week; values are Date#getDay. */
export const WEEKDAYS: { value: number; short: string; long: string }[] = [
  { value: 1, short: "Seg", long: "Segunda" },
  { value: 2, short: "Ter", long: "Terça" },
  { value: 3, short: "Qua", long: "Quarta" },
  { value: 4, short: "Qui", long: "Quinta" },
  { value: 5, short: "Sex", long: "Sexta" },
  { value: 6, short: "Sáb", long: "Sábado" },
  { value: 0, short: "Dom", long: "Domingo" },
];

export const LIMIT_PERIODS: Record<
  LimitPeriod,
  { label: string; per: string }
> = {
  DAY: { label: "Por dia", per: "por dia" },
  WEEK: { label: "Por semana", per: "por semana" },
  MONTH: { label: "Por mês", per: "por mês" },
};

/** Slot lengths offered in the form (the API accepts any 15-min step). */
export const SLOT_OPTIONS = [
  30, 45, 60, 90, 120, 180, 240, 360, 480, 720, 1440,
];

const plural = (count: number, one: string, many: string) =>
  `${count} ${count === 1 ? one : many}`;

/** "1 h", "1 h 30", "45 min", "1 dia". */
export function formatDuration(minutes: number): string {
  if (minutes === 1440) return "1 dia";
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest ? `${hours} h ${String(rest).padStart(2, "0")}` : `${hours} h`;
}

/** "08:00–22:00" ("24:00" reads as "24h"). */
const range = (day: OpeningHours) =>
  `${day.opensAt}–${day.closesAt === "24:00" ? "24h" : day.closesAt}`;

/**
 * The week in a few lines, grouping consecutive days with the same hours:
 * "Seg a Sex · 08:00–22:00", "Sáb e Dom · 09:00–18:00".
 */
export function summarizeOpeningHours(hours: OpeningHours[]): string[] {
  if (hours.length === 0) return ["Fechado todos os dias"];
  const byDay = new Map(hours.map((day) => [day.weekday, range(day)]));
  if (byDay.size === 7 && new Set(byDay.values()).size === 1) {
    return [`Todos os dias · ${[...byDay.values()][0]}`];
  }
  const groups: { days: string[]; hours: string }[] = [];
  for (const day of WEEKDAYS) {
    const value = byDay.get(day.value);
    if (!value) continue;
    const last = groups[groups.length - 1];
    const previous = WEEKDAYS[WEEKDAYS.indexOf(day) - 1];
    if (
      last &&
      last.hours === value &&
      previous &&
      byDay.get(previous.value) === value
    ) {
      last.days.push(day.short);
    } else {
      groups.push({ days: [day.short], hours: value });
    }
  }
  return groups.map(({ days, hours: value }) => {
    const label =
      days.length === 1
        ? days[0]
        : days.length === 2
          ? `${days[0]} e ${days[1]}`
          : `${days[0]} a ${days[days.length - 1]}`;
    return `${label} · ${value}`;
  });
}

/** The booking rules as short sentences for residents. */
export function describeRules(rules: SpaceRules): string[] {
  const lines = [`Reservas de ${formatDuration(rules.slotMinutes)}`];
  lines.push(
    rules.minAdvanceHours > 0
      ? `Reserve com pelo menos ${plural(rules.minAdvanceHours, "hora", "horas")} de antecedência`
      : "Pode reservar em cima da hora",
  );
  lines.push(
    `Agenda aberta para os próximos ${plural(rules.maxAdvanceDays, "dia", "dias")}`,
  );
  if (rules.unitLimit) {
    lines.push(
      `Até ${plural(rules.unitLimit.count, "reserva", "reservas")} ${LIMIT_PERIODS[rules.unitLimit.period].per} por unidade`,
    );
  }
  lines.push(
    rules.cancelUntilHours > 0
      ? `Cancele até ${plural(rules.cancelUntilHours, "hora", "horas")} antes do início`
      : "Pode cancelar até o horário de início",
  );
  if (rules.requiresApproval) {
    lines.push("Cada reserva passa pela aprovação da administração");
  }
  return lines;
}
