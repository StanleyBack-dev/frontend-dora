import type { Category } from "@/shared/contracts/catalog";

/** A year, or one of its months (1–12). */
export type IndicatorPeriod = { year: number; month: number | null };

export type CategorySpend = {
  category: Category;
  cents: number;
  purchases: number;
};

export type MonthSpend = { month: number; cents: number };

export type SupplierSpend = {
  supplierId: string | null;
  supplierName: string;
  cents: number;
  purchases: number;
  ratingAverage: number | null;
  ratingCount: number;
};

/** The management's figures of a period. */
export type PurchaseIndicators = {
  period: IndicatorPeriod;
  /** Paid in the period (cash basis). */
  paidCents: number;
  paidInstallments: number;
  purchases: number;
  /** Owed now by the placed orders. */
  committed: { cents: number; installments: number; orders: number };
  byCategory: CategorySpend[];
  /** Each month of the period's year. */
  byMonth: MonthSpend[];
  bySupplier: SupplierSpend[];
  /** The orders placed in the period. */
  process: {
    orders: number;
    savingsCents: number;
    withThreeQuotes: number;
    avgDaysToOrder: number | null;
    avgDaysToDeliver: number | null;
    lateDeliveries: number;
  };
};

/** Whether the residents see the accounts. */
export type TransparencyStatus = {
  enabled: boolean;
  updatedAt: string | null;
  updatedByName: string | null;
  /** Publishes or withdraws them (the approvers). */
  canManage: boolean;
  /** Sees them even unpublished (the management and the approvers). */
  canPreview: boolean;
};

export type TransparencySummary = {
  period: IndicatorPeriod;
  paidCents: number;
  purchases: number;
  byCategory: CategorySpend[];
  byMonth: MonthSpend[];
};

/** A completed purchase, as the residents see it. */
export type TransparencyPurchase = {
  number: number;
  title: string;
  categories: Category[];
  categoryOther: string | null;
  supplierName: string;
  totalCents: number;
  completedOn: string;
  quoteCount: number;
};
