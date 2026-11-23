import { apiRequest } from "@/shared/lib/api-client";
import type {
  PaymentInput,
  PurchaseOrderView,
} from "@/shared/contracts/purchase-orders";

const installment = (requestId: string, installmentId: string) =>
  `/purchases/requests/${requestId}/installments/${installmentId}`;

/** The payments to the suppliers, from the browser (through the BFF). */
export const purchasePaymentsClient = {
  pay: (
    requestId: string,
    installmentId: string,
    input: PaymentInput,
    file: string | null,
  ) =>
    apiRequest<PurchaseOrderView>(installment(requestId, installmentId), {
      method: "POST",
      body: JSON.stringify({ ...input, file }),
    }),

  unpay: (requestId: string, installmentId: string) =>
    apiRequest<PurchaseOrderView>(installment(requestId, installmentId), {
      method: "DELETE",
    }),

  reschedule: (requestId: string, installmentId: string, dueOn: string) =>
    apiRequest<PurchaseOrderView>(installment(requestId, installmentId), {
      method: "PATCH",
      body: JSON.stringify({ dueOn }),
    }),
};
