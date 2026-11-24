import { apiRequest } from "@/shared/lib/api-client";
import type {
  PlaceOrderInput,
  PurchaseOrderView,
  ReceiptInput,
} from "@/shared/contracts/purchase-orders";

const base = (requestId: string) => `/purchases/requests/${requestId}`;

/** The orders of approved purchases, from the browser (through the BFF). */
export const purchaseOrdersClient = {
  view: (requestId: string) =>
    apiRequest<PurchaseOrderView>(`${base(requestId)}/order`),

  cancel: (requestId: string, reason: string, backToQuotes: boolean) =>
    apiRequest<PurchaseOrderView | null>(`${base(requestId)}/order/cancel`, {
      method: "POST",
      body: JSON.stringify({ reason, backToQuotes }),
    }),

  sendByEmail: (
    requestId: string,
    input: { emails: string[]; message: string },
  ) =>
    apiRequest<{ sent: number }>(`${base(requestId)}/order/email`, {
      method: "POST",
      body: JSON.stringify(input),
    }),

  place: (requestId: string, input: PlaceOrderInput) =>
    apiRequest<PurchaseOrderView>(`${base(requestId)}/order`, {
      method: "POST",
      body: JSON.stringify(input),
    }),

  addReceipt: (requestId: string, input: ReceiptInput, file: string | null) =>
    apiRequest<PurchaseOrderView>(`${base(requestId)}/receipts`, {
      method: "POST",
      body: JSON.stringify({ ...input, file }),
    }),

  removeReceipt: (requestId: string, receiptId: string) =>
    apiRequest<PurchaseOrderView>(`${base(requestId)}/receipts/${receiptId}`, {
      method: "DELETE",
    }),

  rate: (requestId: string, rating: number, comment: string | null) =>
    apiRequest<PurchaseOrderView>(`${base(requestId)}/rating`, {
      method: "PUT",
      body: JSON.stringify({ rating, comment }),
    }),
};
