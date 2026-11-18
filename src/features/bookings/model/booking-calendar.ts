import type { Booking, BookingStatus } from "@/shared/contracts/bookings";
import type { Space } from "@/shared/contracts/spaces";
import { dayRange, localDay, TIME_ZONE } from "@/shared/lib/datetime";

// The manager's calendar of bookings: weeks (Sunday to Saturday, as the
// Brazilian calendar) and months, in Goiás time. Days are "YYYY-MM-DD".

export const CALENDAR_VIEWS = ["semana", "mes", "lista"] as const;
export type CalendarView = (typeof CALENDAR_VIEWS)[number];

const DAY_MS = 86_400_000;
const noon = (day: string) => new Date(`${day}T12:00:00Z`);

/** The day `count` days after (or before) `day`. */
export const addDays = (day: string, count: number) =>
  new Date(noon(day).getTime() + count * DAY_MS).toISOString().slice(0, 10);

/** 0 = Sunday … 6 = Saturday. */
export const weekdayOf = (day: string) => noon(day).getUTCDay();

/** The Sunday that opens the week of `day`. */
export const weekStart = (day: string) => addDays(day, -weekdayOf(day));

/** The seven days of the week of `day`. */
export const weekDays = (day: string) => {
  const first = weekStart(day);
  return Array.from({ length: 7 }, (_, index) => addDays(first, index));
};

/** The weeks shown for the month of `day` (whole weeks, 4 to 6 of them). */
export function monthWeeks(day: string): string[][] {
  const month = day.slice(0, 7);
  const weeks: string[][] = [];
  for (
    let start = weekStart(`${month}-01`);
    start.slice(0, 7) <= month;
    start = addDays(start, 7)
  ) {
    weeks.push(weekDays(start));
  }
  return weeks;
}

/** The [from, to) instants the view needs from the API. */
export function calendarRange(view: "semana" | "mes", day: string) {
  const days = view === "semana" ? weekDays(day) : monthWeeks(day).flat();
  return {
    from: dayRange(days[0]).from,
    to: dayRange(days[days.length - 1]).to,
  };
}

/** Where the arrows go: the previous or next week or month. */
export function shiftAnchor(view: "semana" | "mes", day: string, step: 1 | -1) {
  if (view === "semana") return addDays(day, 7 * step);
  const [year, month] = day.slice(0, 7).split("-").map(Number);
  const index = year * 12 + (month - 1) + step;
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${Math.floor(index / 12)}-${pad((index % 12) + 1)}-01`;
}

const hourFormat = new Intl.DateTimeFormat("pt-BR", {
  timeZone: TIME_ZONE,
  hour: "2-digit",
  hourCycle: "h23",
});

/** The hour (0–23) a booking starts at, in Goiás time. */
export const startHour = (booking: Pick<Booking, "startsAt">) =>
  Number(hourFormat.format(new Date(booking.startsAt)));

/**
 * The hour rows of the week grid: from the earliest opening to the latest
 * closing of the spaces shown, widened to fit every booking (7h–22h when
 * no space says otherwise).
 */
export function hourRows(spaces: Space[], bookings: Booking[]): number[] {
  let first = 24;
  let last = 0;
  for (const space of spaces) {
    for (const hours of space.rules.openingHours) {
      first = Math.min(first, Number(hours.opensAt.slice(0, 2)));
      const [h, m] = hours.closesAt.split(":").map(Number);
      last = Math.max(last, m > 0 ? h + 1 : h);
    }
  }
  if (first >= last) [first, last] = [7, 22];
  for (const booking of bookings) {
    const hour = startHour(booking);
    first = Math.min(first, hour);
    last = Math.max(last, hour + 1);
  }
  return Array.from({ length: last - first }, (_, index) => first + index);
}

/** The bookings of each day, by start time. */
export function bookingsByDay(bookings: Booking[]) {
  const days: Record<string, Booking[]> = {};
  for (const booking of [...bookings].sort((a, b) =>
    a.startsAt.localeCompare(b.startsAt),
  )) {
    (days[localDay(booking.startsAt)] ??= []).push(booking);
  }
  return days;
}

/**
 * A solid colour per status (background, border and readable text), so the
 * grid reads at a glance: orange waits, light green is confirmed, grey was
 * rejected and dark red was cancelled.
 */
export const STATUS_STYLES: Record<BookingStatus, string> = {
  PENDING: "border-brand bg-brand text-brand-fg",
  CONFIRMED: "border-positive bg-positive text-positive-fg",
  REJECTED: "border-border-strong bg-border-strong text-fg",
  CANCELLED: "border-booked bg-booked text-booked-fg",
};

const weekdayShort = new Intl.DateTimeFormat("pt-BR", {
  timeZone: "UTC",
  weekday: "short",
});
const dayMonth = new Intl.DateTimeFormat("pt-BR", {
  timeZone: "UTC",
  day: "numeric",
  month: "short",
});
const dayMonthYear = new Intl.DateTimeFormat("pt-BR", {
  timeZone: "UTC",
  day: "numeric",
  month: "short",
  year: "numeric",
});

/** "dom" … "sáb". */
export const formatWeekday = (day: string) =>
  weekdayShort.format(noon(day)).replace(".", "");

/** "16 de nov. – 22 de nov. de 2026". */
export const formatWeekRange = (days: string[]) =>
  `${dayMonth.format(noon(days[0]))} – ${dayMonthYear.format(noon(days[days.length - 1]))}`;

const dayFull = new Intl.DateTimeFormat("pt-BR", {
  timeZone: "UTC",
  weekday: "long",
  day: "numeric",
  month: "long",
});

/** "quarta-feira, 18 de novembro". */
export const formatDayFull = (day: string) => dayFull.format(noon(day));

/** "07:00". */
export const formatHour = (hour: number) =>
  `${String(hour).padStart(2, "0")}:00`;
