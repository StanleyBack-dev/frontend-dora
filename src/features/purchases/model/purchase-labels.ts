import type {
  PurchaseCategory,
  SupplierDocumentType,
} from "@/shared/contracts/purchases";
import { maskCpf } from "@/shared/lib/identity-document";
import { maskCnpj } from "@/shared/lib/masks";

/** The categories in the order the forms and filters show them. */
export const PURCHASE_CATEGORIES: PurchaseCategory[] = [
  "MAINTENANCE",
  "ELECTRICAL",
  "PLUMBING",
  "PAINTING",
  "CONSTRUCTION",
  "ELEVATORS",
  "CLEANING",
  "PEST_CONTROL",
  "GARDENING",
  "POOL",
  "SECURITY",
  "TECHNOLOGY",
  "OFFICE",
  "FOOD",
  "EVENTS",
  "FURNITURE",
  "UNIFORMS",
  "GAS",
  "PROFESSIONAL",
  "OTHER",
];

export const PURCHASE_CATEGORY_LABELS: Record<PurchaseCategory, string> = {
  MAINTENANCE: "Manutenção geral",
  ELECTRICAL: "Elétrica",
  PLUMBING: "Hidráulica",
  PAINTING: "Pintura",
  CONSTRUCTION: "Obras e reformas",
  ELEVATORS: "Elevadores",
  CLEANING: "Limpeza e higiene",
  PEST_CONTROL: "Dedetização e pragas",
  GARDENING: "Jardinagem",
  POOL: "Piscina",
  SECURITY: "Segurança e portaria",
  TECHNOLOGY: "Tecnologia e informática",
  OFFICE: "Escritório e papelaria",
  FOOD: "Alimentação e bebidas",
  EVENTS: "Festas e eventos",
  FURNITURE: "Móveis e utensílios",
  UNIFORMS: "Uniformes e EPIs",
  GAS: "Gás",
  PROFESSIONAL: "Serviços profissionais (contábil, jurídico, engenharia)",
  OTHER: "Outros",
};

export const SUPPLIER_DOCUMENT_LABELS: Record<SupplierDocumentType, string> = {
  CNPJ: "CNPJ",
  CPF: "CPF",
};

/** The document with its mask ("11.222.333/0001-81", "529.982.247-25"). */
export const maskSupplierDocument = (
  type: SupplierDocumentType,
  value: string,
) => (type === "CNPJ" ? maskCnpj(value) : maskCpf(value));

/** What a supplier serves: its categories, "Outros" as the text typed. */
export const supplierCategoryLabels = (supplier: {
  categories: PurchaseCategory[];
  categoryOther: string | null;
}) =>
  supplier.categories.map((category) =>
    category === "OTHER" && supplier.categoryOther
      ? supplier.categoryOther
      : PURCHASE_CATEGORY_LABELS[category],
  );
