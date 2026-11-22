import type { SupplierDocumentType } from "@/shared/contracts/suppliers";
import { maskCpf } from "@/shared/lib/identity-document";
import { maskCnpj } from "@/shared/lib/masks";

export const SUPPLIER_DOCUMENT_LABELS: Record<SupplierDocumentType, string> = {
  CNPJ: "CNPJ",
  CPF: "CPF",
};

/** The document with its mask ("11.222.333/0001-81", "529.982.247-25"). */
export const maskSupplierDocument = (
  type: SupplierDocumentType,
  value: string,
) => (type === "CNPJ" ? maskCnpj(value) : maskCpf(value));
