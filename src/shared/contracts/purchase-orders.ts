/**
 * Orders (pedidos) of approved purchases: the purchase order, the deliveries
 * (in part or in full, with the invoice) and the installments paid to the
 * supplier. Contract types shared by the BFF routes and the UI. Money in
 * cents (null: hidden from whoever doesn't see values); days "YYYY-MM-DD".
 */
import type { PaymentMethod } from "@/shared/contracts/purchase-quotes";
import type { PurchaseRequest } from "@/shared/contracts/purchase-requests";
import type { PurchaseInstallmentState as InstallmentState } from "@/shared/graphql/schema-enums";

export type { InstallmentState };

export type PurchaseReceipt = {
  id: string;
  receivedOn: string;
  items: { requestItemId: string; quantity: number }[];
  invoiceNumber: string | null;
  invoiceCents: number | null;
  invoiceDate: string | null;
  /** A short-lived link to the invoice (null: none). */
  fileUrl: string | null;
  fileIsPdf: boolean | null;
  note: string | null;
  receivedById: string | null;
  receivedByName: string | null;
  createdAt: string;
};

export type PurchaseInstallment = {
  id: string;
  number: number;
  amountCents: number;
  dueOn: string;
  /** null: not paid. */
  paidOn: string | null;
  paidByName: string | null;
  /** A short-lived link to the proof (null: none). */
  proofUrl: string | null;
  proofIsPdf: boolean | null;
  note: string | null;
};

export type PurchaseOrderRating = {
  rating: number;
  comment: string | null;
  ratedByName: string | null;
  ratedAt: string;
};

export type PurchaseOrder = {
  id: string;
  /** Shown as "OC-0001". */
  number: number;
  supplierName: string;
  /** To send the order to (null: none, or hidden). */
  supplierEmail: string | null;
  /** For WhatsApp (null: none registered, or hidden). */
  supplierPhone: string | null;
  itemsCents: number | null;
  totalCents: number | null;
  paymentMethod: PaymentMethod | null;
  paymentTerms: string | null;
  expectedOn: string | null;
  notes: string | null;
  orderedByName: string | null;
  orderedAt: string;
  completedAt: string | null;
  receipts: PurchaseReceipt[];
  /** Empty for whoever doesn't see values. */
  installments: PurchaseInstallment[];
  rating: PurchaseOrderRating | null;
};

/** A request's item and how its delivery stands. */
export type PurchaseOrderLine = {
  requestItemId: string;
  productName: string;
  brandName: string | null;
  note: string | null;
  unit: string;
  quantity: number;
  received: number;
  pending: number;
  unitPriceCents: number | null;
  lineCents: number | null;
};

/** What the order of an approved purchase will be. */
export type PurchaseOrderPlan = {
  supplierName: string;
  itemsCents: number;
  totalCents: number;
  paymentMethod: PaymentMethod | null;
  paymentTerms: string | null;
  deliveryDays: number | null;
  /** Each installment (one: paid at once). */
  installmentValues: number[];
};

/** An order cancelled before anything arrived or was paid. */
export type CancelledPurchaseOrder = {
  number: number;
  supplierName: string;
  /** null: hidden. */
  totalCents: number | null;
  orderedAt: string;
  cancelledAt: string;
  cancelledByName: string | null;
  reason: string;
};

/** A purchase's order page. */
export type PurchaseOrderView = {
  request: PurchaseRequest;
  /** null: approved, the order still to place. */
  order: PurchaseOrder | null;
  lines: PurchaseOrderLine[];
  plan: PurchaseOrderPlan | null;
  /** Orders cancelled before, the latest first. */
  cancelledOrders: CancelledPurchaseOrder[];
  /** Places the order, pays, rates and undoes. */
  canManage: boolean;
  canSeeMoney: boolean;
};

/** A purchase on the orders page. */
export type OrderBoardRow = {
  request: PurchaseRequest;
  orderNumber: number | null;
  supplierName: string | null;
  totalCents: number | null;
  expectedOn: string | null;
  itemsReceived: number;
  itemCount: number;
  /** Deliveries recorded (part may have arrived though no item is complete). */
  receiptCount: number;
  installmentsPaid: number;
  installmentCount: number;
  nextDueOn: string | null;
};

/** The orders page's cards. */
export type OrderBoardOverview = {
  toOrder: number;
  awaitingDelivery: number;
  unpaidInstallments: number;
  unpaidCents: number;
  overdueInstallments: number;
  completedThisMonth: number;
};

export type PlaceOrderInput = {
  expectedOn: string | null;
  firstDueOn: string;
  notes: string | null;
};

export type ReceiptInput = {
  receivedOn: string;
  items: { requestItemId: string; quantity: number }[];
  invoiceNumber: string | null;
  invoiceCents: number | null;
  invoiceDate: string | null;
  note: string | null;
};

export type PaymentInput = { paidOn: string; note: string | null };

/** The deliveries page's cards. */
export type DeliveryBoardOverview = {
  awaitingDelivery: number;
  lateDeliveries: number;
  partialDeliveries: number;
  receiptsThisMonth: number;
};

/** An installment on the payments page, with its purchase. */
export type PaymentBoardRow = PurchaseInstallment & {
  installmentCount: number;
  requestId: string;
  requestNumber: number;
  requestTitle: string;
  orderNumber: number;
  orderedAt: string;
  supplierName: string;
};

export type PaymentFilter = {
  states?: InstallmentState[];
  requestId?: string;
  supplierId?: string;
};

/** The payments page's cards. */
export type PaymentBoardOverview = {
  openCents: number;
  openCount: number;
  overdueCents: number;
  overdueCount: number;
  dueSoonCents: number;
  dueSoonCount: number;
  paidThisMonthCents: number;
  paidThisMonthCount: number;
};
