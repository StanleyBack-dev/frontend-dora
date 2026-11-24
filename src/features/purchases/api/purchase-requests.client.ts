import { apiRequest } from "@/shared/lib/api-client";
import type {
  PurchaseRequest,
  PurchaseRequestInput,
} from "@/shared/contracts/purchase-requests";

export const purchaseRequestsClient = {
  create: (input: PurchaseRequestInput) =>
    apiRequest<PurchaseRequest>("/purchases/requests", {
      method: "POST",
      body: JSON.stringify(input),
    }),

  update: (id: string, input: PurchaseRequestInput) =>
    apiRequest<PurchaseRequest>(`/purchases/requests/${id}`, {
      method: "PUT",
      body: JSON.stringify(input),
    }),

  cancel: (id: string, reason: string) =>
    apiRequest<PurchaseRequest>(`/purchases/requests/${id}/cancel`, {
      method: "POST",
      body: JSON.stringify({ reason }),
    }),
};
