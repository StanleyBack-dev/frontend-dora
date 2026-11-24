/**
 * Purchase requests (solicitações de compra): contract types shared by the
 * BFF routes and the UI. Dates are ISO strings; days are "YYYY-MM-DD".
 */
import type {
  Category,
  PurchasePriority,
  PurchaseRequestStatus,
} from "@/shared/graphql/schema-enums";

export type { PurchasePriority, PurchaseRequestStatus };

export type PurchaseRequestItem = {
  id: string;
  /** A product of the condominium's catalog. */
  productId: string;
  productName: string;
  quantity: number;
  unit: string;
  /** The brand asked for (null: any brand). */
  brandId: string | null;
  brandName: string | null;
  /** What else identifies it (color, size, model…). */
  note: string | null;
};

export type PurchaseRequest = {
  id: string;
  /** Sequential in the condominium (shown as "SC-0001"). */
  number: number;
  title: string;
  description: string | null;
  categories: Category[];
  /** With OTHER among them: what it is about, typed (null otherwise). */
  categoryOther: string | null;
  priority: PurchasePriority;
  /** A space of the condominium (null: another place or none). */
  spaceId: string | null;
  /** The space's name, or the place typed. */
  location: string | null;
  /** The day it is needed by. */
  neededBy: string | null;
  status: PurchaseRequestStatus;
  requestedById: string;
  requestedByName: string;
  items: PurchaseRequestItem[];
  /** How many quotes it has. */
  quoteCount: number;
  /** The quote the management chose (null: none yet). */
  chosenQuoteId: string | null;
  choiceJustification: string | null;
  chosenAt: string | null;
  /** Who chose the quote. */
  chosenByName: string | null;
  cancelReason: string | null;
  cancelledAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type PurchaseRequestInput = {
  title: string;
  description: string | null;
  categories: Category[];
  categoryOther: string | null;
  priority: PurchasePriority;
  spaceId: string | null;
  location: string | null;
  neededBy: string | null;
  items: {
    productId: string;
    quantity: number;
    unit: string;
    brandId: string | null;
    note: string | null;
  }[];
};

/** How the catalog is used by the requests (the catalog pages' cards). */
export type PurchaseCatalogUsage = {
  productsInUse: number;
  topProduct: { name: string; requestCount: number } | null;
  brandsInUse: number;
  topBrand: { name: string; requestCount: number } | null;
};

export type PurchaseRequestFilter = {
  requestId?: string;
  requestedById?: string;
  /** With this category among theirs. */
  category?: Category;
  priority?: PurchasePriority;
  statuses?: PurchaseRequestStatus[];
};

/** What the requests' filters offer (the requests the caller sees). */
export type PurchaseRequestFilterOptions = {
  requests: { id: string; number: number; title: string }[];
  requesters: { id: string; name: string }[];
};

/** The requests in numbers (the page's cards), whatever the filters. */
export type PurchaseRequestOverview = {
  open: number;
  urgent: number;
  dueSoon: number;
  overdue: number;
};
