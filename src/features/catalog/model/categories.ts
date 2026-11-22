import type { Category } from "@/shared/contracts/catalog";

// The categories shared by the modules (what a purchase request or a
// supplier is about): a fixed list; anything else is "Outros" with a text.

/** The categories in the order the forms and filters show them. */
export const CATEGORIES: Category[] = [
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

export const CATEGORY_LABELS: Record<Category, string> = {
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

/** The categories of a record, "Outros" as the text typed. */
export const categoryLabels = (value: {
  categories: Category[];
  categoryOther: string | null;
}) =>
  value.categories.map((category) =>
    category === "OTHER" && value.categoryOther
      ? value.categoryOther
      : CATEGORY_LABELS[category],
  );
