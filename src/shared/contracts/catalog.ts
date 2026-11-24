// The condominium's catalog (products and brands), shared by the modules
// that deal with things: contract types for the BFF routes and the UI.
import type { Category } from "@/shared/graphql/schema-enums";

export type { Category };

export type Product = {
  id: string;
  name: string;
  /** The usual unit ("un", "cx", "kg"…). */
  unit: string;
  description: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
};

export type Brand = {
  id: string;
  name: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
};

/** A product or brand in a select (new uses offer the active ones). */
export type CatalogOption = {
  id: string;
  name: string;
  active: boolean;
  /** Products: the usual unit. */
  unit?: string | null;
};

export type ProductInput = {
  name: string;
  unit: string;
  description: string | null;
};

export type CatalogFilter = {
  /** Exactly this product or brand. */
  id?: string;
  /** true: active only; false: inactive only; absent: both. */
  active?: boolean;
};

export type CatalogCounts = { active: number; inactive: number };
