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
