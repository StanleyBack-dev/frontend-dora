import { apiRequest } from "@/shared/lib/api-client";
import type {
  ApprovalMode,
  PurchaseSettings,
} from "@/shared/contracts/purchase-approvals";

// The approval of the chosen quotes, from the browser (through the BFF).
export const purchaseApprovalsClient = {
  updateSettings: (input: {
    approvalMode: ApprovalMode;
    approvalLimitCents: number | null;
  }) =>
    apiRequest<PurchaseSettings>("/purchases/settings", {
      method: "PUT",
      body: JSON.stringify(input),
    }),

  approve: (requestId: string, note: string | null) =>
    apiRequest<{ ok: true }>(`/purchases/requests/${requestId}/approve`, {
      method: "POST",
      body: JSON.stringify({ note }),
    }),

  returnToQuotes: (requestId: string, reason: string) =>
    apiRequest<{ ok: true }>(`/purchases/requests/${requestId}/return`, {
      method: "POST",
      body: JSON.stringify({ reason }),
    }),

  reject: (requestId: string, reason: string) =>
    apiRequest<{ ok: true }>(`/purchases/requests/${requestId}/reject`, {
      method: "POST",
      body: JSON.stringify({ reason }),
    }),
};
