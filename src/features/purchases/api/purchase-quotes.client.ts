import { apiRequest } from "@/shared/lib/api-client";
import type {
  PurchaseQuote,
  PurchaseQuoteInput,
} from "@/shared/contracts/purchase-quotes";

export const purchaseQuotesClient = {
  add: (
    requestId: string,
    supplierId: string,
    input: PurchaseQuoteInput,
    file: string | null,
  ) =>
    apiRequest<PurchaseQuote>(`/purchases/requests/${requestId}/quotes`, {
      method: "POST",
      body: JSON.stringify({ supplierId, ...input, file }),
    }),

  update: (
    id: string,
    input: PurchaseQuoteInput,
    file: string | null,
    removeFile: boolean,
  ) =>
    apiRequest<PurchaseQuote>(`/purchases/quotes/${id}`, {
      method: "PUT",
      body: JSON.stringify({ ...input, file, removeFile }),
    }),

  remove: (id: string) =>
    apiRequest<{ ok: true }>(`/purchases/quotes/${id}`, { method: "DELETE" }),

  choose: (id: string, justification: string | null) =>
    apiRequest<{ ok: true }>(`/purchases/quotes/${id}/choose`, {
      method: "POST",
      body: JSON.stringify({ justification }),
    }),

  shareMapByEmail: (
    requestId: string,
    input: { emails: string[]; message: string },
  ) =>
    apiRequest<{ sent: number }>(
      `/purchases/requests/${requestId}/quote-map/email`,
      { method: "POST", body: JSON.stringify(input) },
    ),

  reopen: (requestId: string) =>
    apiRequest<{ ok: true }>(`/purchases/requests/${requestId}/reopen`, {
      method: "POST",
    }),
};
