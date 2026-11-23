// Quotes (cotações) of a purchase request: contract types shared by the BFF
// routes and the UI. Money in cents; days "YYYY-MM-DD".
import type { Category } from "@/shared/contracts/catalog";
import type { PurchaseRequest } from "@/shared/contracts/purchase-requests";
import type { PaymentMethod } from "@/shared/graphql/schema-enums";

export type { PaymentMethod };

export type PurchaseQuoteLine = {
  requestItemId: string;
  /** null: the supplier didn't quote it. */
  unitPriceCents: number | null;
  lineCents: number | null;
};

export type PurchaseQuote = {
  id: string;
  supplierId: string;
  supplierName: string;
  /** In the request's item order. */
  lines: PurchaseQuoteLine[];
  shippingCents: number;
  /** Other charges (installation, fees…), each with its value. */
  charges: QuoteCharge[];
  /** The charges' sum. */
  chargesCents: number;
  discountCents: number;
  /** The discount's percent in basis points (5% = 500; null: a fixed value). */
  discountPercentBp: number | null;
  /** Monthly interest in basis points (1,99% = 199; null: none). */
  interestRateBp: number | null;
  itemsCents: number;
  /** Items + shipping + charges − discount (paid at once). */
  cashCents: number;
  /** What is paid in the end (with interest, the installments sum). */
  totalCents: number;
  interestCents: number;
  /** Each installment (empty: at once). */
  installmentValues: number[];
  /** Every item priced. */
  complete: boolean;
  /** The cheapest complete quote (ties too). */
  cheapest: boolean;
  chosen: boolean;
  deliveryDays: number | null;
  paymentMethod: PaymentMethod | null;
  /** Installments (null: at once). */
  installments: number | null;
  /** With OTHER: the terms typed. */
  paymentTerms: string | null;
  validUntil: string | null;
  notes: string | null;
  /** Short-lived link to the supplier's document. */
  fileUrl: string | null;
  fileIsPdf: boolean | null;
  createdAt: string;
};

/** One of a quote's other charges. */
export type QuoteCharge = { label: string; amountCents: number };

export type PurchaseQuoteInput = {
  items: { requestItemId: string; unitPriceCents: number | null }[];
  shippingCents: number | null;
  charges: QuoteCharge[];
  /** A fixed discount (ignored with a percent). */
  discountCents: number | null;
  discountPercentBp: number | null;
  interestRateBp: number | null;
  deliveryDays: number | null;
  paymentMethod: PaymentMethod | null;
  installments: number | null;
  paymentTerms: string | null;
  validUntil: string | null;
  notes: string | null;
};

/** An active supplier for the quote's select, with what it serves. */
export type QuoteSupplierOption = {
  id: string;
  name: string;
  categories: Category[];
  categoryOther: string | null;
};

/** A supplier and what its quote costs in the end. */
export type QuoteBoardPick = { supplierName: string; totalCents: number };

/** A request on the quotes page, with how its quotes stand. */
export type QuoteBoardRow = {
  request: PurchaseRequest;
  quoteCount: number;
  /** Quotes pricing every item. */
  completeCount: number;
  /** The cheapest complete quote. */
  cheapest: QuoteBoardPick | null;
  chosen: QuoteBoardPick | null;
};

/** The quotes page's cards. */
export type QuoteBoardOverview = {
  awaitingQuotes: number;
  quoting: number;
  /** In quotes with fewer than MIN_QUOTES. */
  belowMinimum: number;
  awaitingApproval: number;
};

/** Below this many quotes, choosing one asks a justification. */
export const MIN_QUOTES = 3;
