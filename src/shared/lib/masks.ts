// Input masks, applied as the user types, and the matching validation
// messages (null = valid). They only shape and check the text in the form;
// the backend validates every value again.

const digitsOf = (value: string) => value.replace(/\D/g, "");

// --- phone (Brazil) ---------------------------------------------------------

/** "(62) 3333-0000" or "(62) 99999-0000", built while typing. */
export function maskPhone(value: string): string {
  // A pasted "+55 …" keeps only DDD + number.
  const all = digitsOf(value);
  const digits = (
    all.length > 11 && all.startsWith("55") ? all.slice(2) : all
  ).slice(0, 11);
  if (digits.length === 0) return "";
  if (digits.length <= 2) return `(${digits}`;
  const ddd = digits.slice(0, 2);
  const number = digits.slice(2);
  // 8 digits: landline (4-4); 9 digits: mobile (5-4).
  const split = number.length > 8 ? 5 : 4;
  return number.length <= split
    ? `(${ddd}) ${number}`
    : `(${ddd}) ${number.slice(0, split)}-${number.slice(split)}`;
}

export function phoneError(value: string): string | null {
  const digits = digitsOf(value);
  if (digits.length === 0) return null;
  if (digits.length < 10) return "Informe o DDD e o número completo.";
  if (digits.length === 11 && digits[2] !== "9") {
    return "Celular começa com 9 depois do DDD.";
  }
  return null;
}

/** Stored digits → "(62) 99999-0000" for display. */
export function formatPhone(digits: string | null): string {
  if (!digits) return "—";
  const match = /^(\d{2})(\d{4,5})(\d{4})$/.exec(digits);
  return match ? `(${match[1]}) ${match[2]}-${match[3]}` : digits;
}

// --- login --------------------------------------------------------------------

/** Login: lowercase letters, digits, dot, hyphen, underscore; 3–32. */
export const maskUsername = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9._-]/g, "")
    .slice(0, 32);

export function usernameError(value: string): string | null {
  return value && value.length < 3 ? "Mínimo de 3 caracteres." : null;
}

/** CNPJ while typing: 00.000.000/0000-00. */
/** "74000100" → "74000-100" while typing. */
export function maskCep(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 8);
  return digits.length > 5
    ? `${digits.slice(0, 5)}-${digits.slice(5)}`
    : digits;
}

export function maskCnpj(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 14);
  return digits
    .replace(/^(\d{2})(\d)/, "$1.$2")
    .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1/$2")
    .replace(/(\d{4})(\d)/, "$1-$2");
}

// --- money ------------------------------------------------------------------

/** Typed money, filled from the right: "15000" → "150,00" (at most R$ 100 mil). */
export function maskMoney(value: string): string {
  const digits = value.replace(/\D/g, "").replace(/^0+/, "").slice(0, 8);
  if (!digits) return "";
  const cents = digits.padStart(3, "0");
  const reais = cents.slice(0, -2).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `${reais},${cents.slice(-2)}`;
}

/** "1.500,00" → 150000 cents (null when empty). */
export function centsOf(masked: string): number | null {
  const digits = masked.replace(/\D/g, "");
  return digits ? Number(digits) : null;
}

/** 150000 cents → "1.500,00" for a masked field. */
export const moneyField = (cents: number | null): string =>
  cents === null ? "" : maskMoney(String(cents));

/** Digits and one comma with up to two decimals ("2,5"). */
export function maskDecimal(value: string): string {
  const [whole, ...rest] = value.replace(/[^\d,]/g, "").split(",");
  return rest.length ? `${whole},${rest.join("").slice(0, 2)}` : whole;
}

/**
 * "2,5" or "2.5" → 2.5 ("1.000,5" → 1000.5): with a comma, dots group
 * thousands; without one, a dot is the decimal. Null when not a number with
 * up to two decimals.
 */
export function parseDecimal(value: string): number | null {
  const raw = value.trim();
  const text = raw.includes(",")
    ? raw.replace(/\./g, "").replace(",", ".")
    : raw;
  return /^\d+(\.\d{1,2})?$/.test(text) ? Number(text) : null;
}
