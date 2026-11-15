import type { DocumentType } from "@/shared/graphql/schema-enums";

export type { DocumentType };

// CPF and RG while typing: the mask keeps only what the document can have
// (digits; an RG may end in "X") and the checks mirror the API's, so the
// person sees the problem before sending.

export const DOCUMENT_LABELS: Record<DocumentType, string> = {
  CPF: "CPF",
  RG: "RG",
};

/** "52998224725" → "529.982.247-25", as it is typed. */
export function maskCpf(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  return digits
    .replace(/^(\d{3})(\d)/, "$1.$2")
    .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/^(\d{3})\.(\d{3})\.(\d{3})(\d)/, "$1.$2.$3-$4");
}

/** The check digits of a CPF (null: valid). */
export function cpfError(value: string): string | null {
  const digits = value.replace(/\D/g, "");
  if (digits.length !== 11) return "O CPF tem 11 números.";
  const invalid = "CPF inválido. Confira os números.";
  if (/^(\d)\1{10}$/.test(digits)) return invalid;
  const check = (length: number) => {
    let sum = 0;
    for (let i = 0; i < length; i += 1) {
      sum += Number(digits[i]) * (length + 1 - i);
    }
    const rest = (sum * 10) % 11;
    return rest === 10 ? 0 : rest;
  };
  return check(9) === Number(digits[9]) && check(10) === Number(digits[10])
    ? null
    : invalid;
}

export const RG_MIN = 7;
export const RG_MAX = 10;

/**
 * Only digits, and an "X" as the last character (RG of SP and other
 * states); shown as "12.345.678-9".
 */
export function maskRg(value: string): string {
  const upper = value.toUpperCase();
  let chars = upper.replace(/[^0-9X]/g, "").slice(0, RG_MAX);
  // An X only at the end: anything typed after it is dropped.
  const x = chars.indexOf("X");
  if (x >= 0) chars = chars.slice(0, x + 1);
  if (chars.length < 2) return chars;
  const body = chars.slice(0, -1).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `${body}-${chars.slice(-1)}`;
}

/** The shape of an RG (null: valid). */
export function rgError(value: string): string | null {
  const rg = value.toUpperCase().replace(/[^0-9X]/g, "");
  if (rg.length < RG_MIN || rg.length > RG_MAX) {
    return `O RG tem de ${RG_MIN} a ${RG_MAX} caracteres.`;
  }
  return /^\d+X?$/.test(rg) ? null : "RG inválido: só números e um X no fim.";
}

export const maskDocument = (type: DocumentType, value: string) =>
  type === "CPF" ? maskCpf(value) : maskRg(value);

export const documentError = (type: DocumentType, value: string) =>
  type === "CPF" ? cpfError(value) : rgError(value);

/** Stored digits → "CPF 529.982.247-25" / "RG 12.345.678-9". */
export function formatDocument(
  type: DocumentType | null,
  value: string | null,
): string | null {
  if (!type || !value) return null;
  return `${DOCUMENT_LABELS[type]} ${maskDocument(type, value)}`;
}
