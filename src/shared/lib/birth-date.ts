// Birth dates (YYYY-MM-DD, as the date input gives them), checked like the
// API does (a real date from 1900 to today), and the age they give.

/** Today in the browser's calendar ("2026-11-16"). */
export const todayIso = () => new Date().toLocaleDateString("en-CA");

/** What is wrong with a birth date (null: fine, or empty and optional). */
export function birthDateError(
  value: string,
  required: boolean,
): string | null {
  const clean = value.trim();
  if (!clean) return required ? "Informe a data de nascimento." : null;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(clean);
  if (!match) return "Data de nascimento inválida.";
  const [y, m, d] = [Number(match[1]), Number(match[2]), Number(match[3])];
  const date = new Date(Date.UTC(y, m - 1, d));
  const real =
    date.getUTCFullYear() === y &&
    date.getUTCMonth() === m - 1 &&
    date.getUTCDate() === d;
  if (!real || clean < "1900-01-01") return "Data de nascimento inválida.";
  if (clean > todayIso()) return "A data de nascimento não pode ser no futuro.";
  return null;
}

/** Whole years on a day (both YYYY-MM-DD). */
export function ageOn(birthDate: string, on: string): number {
  const [by, bm, bd] = birthDate.split("-").map(Number) as [
    number,
    number,
    number,
  ];
  const [y, m, d] = on.split("-").map(Number) as [number, number, number];
  return y - by - (m > bm || (m === bm && d >= bd) ? 0 : 1);
}

/** "2014-05-20" → "20/05/2014". */
export const formatBirthDate = (value: string | null) =>
  value ? value.split("-").reverse().join("/") : "—";
