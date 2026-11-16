import type { PixKeyType } from "@/shared/graphql/schema-enums";
import { cpfError, maskCpf } from "@/shared/lib/identity-document";
import { maskCnpj } from "@/shared/lib/masks";

export type { PixKeyType };

// A PIX key by its type, while typing: the mask keeps only what that type
// can have and the checks mirror the API's (shared/domain/pix.ts), so a
// typo never becomes someone else's key.

export const PIX_KEY_TYPES: {
  value: PixKeyType;
  label: string;
  placeholder: string;
  inputMode: "numeric" | "tel" | "email" | "text";
}[] = [
  {
    value: "CPF",
    label: "CPF",
    placeholder: "000.000.000-00",
    inputMode: "numeric",
  },
  {
    value: "CNPJ",
    label: "CNPJ",
    placeholder: "00.000.000/0000-00",
    inputMode: "numeric",
  },
  {
    value: "PHONE",
    label: "Celular",
    placeholder: "(62) 99999-0000",
    inputMode: "tel",
  },
  {
    value: "EMAIL",
    label: "E-mail",
    placeholder: "financeiro@condominio.com.br",
    inputMode: "email",
  },
  {
    value: "RANDOM",
    label: "Chave aleatória",
    placeholder: "Cole a chave do app do banco",
    inputMode: "text",
  },
];

export const PIX_KEY_TYPE_LABELS = Object.fromEntries(
  PIX_KEY_TYPES.map((type) => [type.value, type.label]),
) as Record<PixKeyType, string>;

const digitsOf = (value: string) => value.replace(/\D/g, "");

/** Brazilian area codes (DDD) in use. */
const DDDS = new Set(
  (
    "11 12 13 14 15 16 17 18 19 21 22 24 27 28 31 32 33 34 35 37 38 " +
    "41 42 43 44 45 46 47 48 49 51 53 54 55 61 62 63 64 65 66 67 68 69 " +
    "71 73 74 75 77 79 81 82 83 84 85 86 87 88 89 91 92 93 94 95 96 97 98 99"
  ).split(" "),
);

/** "(62) 99999-0000" while typing (mobile only: 11 digits). */
function maskMobile(value: string): string {
  const all = digitsOf(value);
  const digits = (
    all.length > 11 && all.startsWith("55") ? all.slice(2) : all
  ).slice(0, 11);
  if (digits.length === 0) return "";
  if (digits.length <= 2) return `(${digits}`;
  const number = digits.slice(2);
  return number.length <= 5
    ? `(${digits.slice(0, 2)}) ${number}`
    : `(${digits.slice(0, 2)}) ${number.slice(0, 5)}-${number.slice(5)}`;
}

/** The random key: hex digits and hyphens, in the 8-4-4-4-12 shape. */
function maskRandom(value: string): string {
  const hex = value
    .toLowerCase()
    .replace(/[^0-9a-f]/g, "")
    .slice(0, 32);
  const parts = [8, 4, 4, 4, 12];
  const out: string[] = [];
  let index = 0;
  for (const size of parts) {
    if (index >= hex.length) break;
    out.push(hex.slice(index, index + size));
    index += size;
  }
  return out.join("-");
}

/** The key masked for its type, as it is typed or pasted. */
export function maskPixKey(type: PixKeyType | "", value: string): string {
  switch (type) {
    case "CPF":
      return maskCpf(value);
    case "CNPJ":
      return maskCnpj(value);
    case "PHONE":
      return maskMobile(value);
    case "EMAIL":
      return value.replace(/\s/g, "").toLowerCase().slice(0, 77);
    case "RANDOM":
      return maskRandom(value);
    default:
      return value;
  }
}

/** CNPJ check digits (14 digits). */
function isCnpj(digits: string): boolean {
  if (!/^\d{14}$/.test(digits) || /^(\d)\1{13}$/.test(digits)) return false;
  const check = (length: number) => {
    let weight = length - 7;
    let sum = 0;
    for (let index = 0; index < length; index += 1) {
      sum += Number(digits[index]) * weight;
      weight = weight === 2 ? 9 : weight - 1;
    }
    const rest = sum % 11;
    return rest < 2 ? 0 : 11 - rest;
  };
  return check(12) === Number(digits[12]) && check(13) === Number(digits[13]);
}

/** What is wrong with the key for its type (null: valid). */
export function pixKeyError(
  type: PixKeyType | "",
  value: string,
): string | null {
  if (!type) return "Escolha o tipo da chave.";
  const key = value.trim();
  if (!key) return "Informe a chave PIX.";
  switch (type) {
    case "CPF":
      return cpfError(key);
    case "CNPJ":
      return isCnpj(digitsOf(key))
        ? null
        : digitsOf(key).length !== 14
          ? "O CNPJ tem 14 números."
          : "CNPJ inválido. Confira os números.";
    case "PHONE": {
      const digits = digitsOf(key);
      if (digits.length !== 11)
        return "Informe o DDD e o celular com 9 dígitos.";
      if (!DDDS.has(digits.slice(0, 2))) return "DDD inválido.";
      if (digits[2] !== "9") return "Celular começa com 9 depois do DDD.";
      return null;
    }
    case "EMAIL":
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(key) ? null : "E-mail inválido.";
    case "RANDOM":
      return /^[0-9a-f]{8}-([0-9a-f]{4}-){3}[0-9a-f]{12}$/.test(key)
        ? null
        : "A chave aleatória tem 32 letras e números (copie do app do banco).";
  }
}

/**
 * A stored key for the form or the screen: CPF and CNPJ masked, the phone
 * without "+55" ("(62) 99999-0000"), e-mail and random key as they are.
 */
export function formatPixKey(type: PixKeyType, key: string): string {
  if (type === "PHONE") return maskMobile(key.replace(/^\+?55/, ""));
  return type === "EMAIL" || type === "RANDOM" ? key : maskPixKey(type, key);
}
