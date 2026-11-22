// Purchases (compras do condomínio): contract types shared by the BFF routes
// and the UI. Dates are ISO strings.
import type {
  PixKeyType,
  PurchaseCategory,
  SupplierDocumentType,
} from "@/shared/graphql/schema-enums";

export type { PurchaseCategory, SupplierDocumentType };

/** Who the condominium buys from: a company (CNPJ) or a person (CPF). */
export type Supplier = {
  id: string;
  documentType: SupplierDocumentType;
  /** Digits only. */
  document: string;
  /** Razão social, or the person's name. */
  name: string;
  tradeName: string | null;
  categories: PurchaseCategory[];
  /** With OTHER among them: what it serves, typed (null otherwise). */
  categoryOther: string | null;
  contactName: string | null;
  email: string | null;
  /** Digits only, with the area code. */
  phone: string | null;
  city: string | null;
  state: string | null;
  pixKeyType: PixKeyType | null;
  pixKey: string | null;
  notes: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
};

export type SupplierInput = {
  documentType: SupplierDocumentType;
  document: string;
  name: string;
  tradeName: string | null;
  categories: PurchaseCategory[];
  /** With OTHER among them: what it serves, typed (null otherwise). */
  categoryOther: string | null;
  contactName: string | null;
  email: string | null;
  phone: string | null;
  city: string | null;
  state: string | null;
  pixKeyType: PixKeyType | null;
  pixKey: string | null;
  notes: string | null;
};

export type SupplierFilter = {
  /** Exactly this supplier ("Nome"). */
  supplierId?: string;
  contactName?: string;
  /** CNPJ/CPF digits. */
  document?: string;
  category?: PurchaseCategory;
  /** true: active only; false: inactive only; absent: both. */
  active?: boolean;
};

/** What the suppliers' filters offer (values in use in the condominium). */
export type SupplierFilterOptions = {
  suppliers: { id: string; name: string }[];
  contacts: string[];
  documents: { documentType: SupplierDocumentType; document: string }[];
};

/** The suppliers in numbers (the page's cards), whatever the filters. */
export type SupplierOverview = {
  active: number;
  inactive: number;
  /** Active ones without a PIX key. */
  activeWithoutPix: number;
  /** Active ones without a phone nor an e-mail. */
  activeWithoutContact: number;
  /** Categories served by at least one active supplier. */
  categoriesServed: number;
};
