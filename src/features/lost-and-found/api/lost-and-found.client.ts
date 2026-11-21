import { apiRequest } from "@/shared/lib/api-client";
import type {
  FoundItem,
  FoundItemClaim,
  LostReport,
  RegisterFoundItemInput,
  ReportLostItemInput,
  ReturnFoundItemInput,
} from "@/shared/contracts/lost-and-found";
import type { ResidentOption } from "@/shared/contracts/residents-search";

export const lostAndFoundClient = {
  register: (input: RegisterFoundItemInput) =>
    apiRequest<FoundItem>("/lost-and-found", {
      method: "POST",
      body: JSON.stringify(input),
    }),

  claim: (itemId: string, message: string | null) =>
    apiRequest<FoundItemClaim>(`/lost-and-found/${itemId}/claim`, {
      method: "POST",
      body: JSON.stringify({ message }),
    }),

  withdraw: (claimId: string) =>
    apiRequest<FoundItemClaim>(`/lost-and-found/claims/${claimId}/withdraw`, {
      method: "POST",
    }),

  owners: (search: string) =>
    apiRequest<ResidentOption[]>(
      `/lost-and-found/owners?search=${encodeURIComponent(search)}`,
    ),

  release: (id: string) =>
    apiRequest<FoundItem>(`/lost-and-found/${id}/release`, {
      method: "POST",
    }),

  decide: (claimId: string, accept: boolean, note: string | null) =>
    apiRequest<FoundItemClaim>(`/lost-and-found/claims/${claimId}/decision`, {
      method: "POST",
      body: JSON.stringify({ accept, note }),
    }),

  returnItem: (id: string, input: ReturnFoundItemInput) =>
    apiRequest<FoundItem>(`/lost-and-found/${id}/return`, {
      method: "POST",
      body: JSON.stringify(input),
    }),

  donate: (id: string, reason: string) =>
    apiRequest<FoundItem>(`/lost-and-found/${id}/donate`, {
      method: "POST",
      body: JSON.stringify({ reason }),
    }),

  discard: (id: string, reason: string) =>
    apiRequest<FoundItem>(`/lost-and-found/${id}/discard`, {
      method: "POST",
      body: JSON.stringify({ reason }),
    }),

  /** "Perdi algo". */
  reportLost: (input: ReportLostItemInput) =>
    apiRequest<LostReport>("/lost-reports", {
      method: "POST",
      body: JSON.stringify(input),
    }),

  spotLostReport: (id: string, note: string | null) =>
    apiRequest<{ ok: true }>(`/lost-reports/${id}/spot`, {
      method: "POST",
      body: JSON.stringify({ note }),
    }),

  closeLostReport: (id: string, found: boolean) =>
    apiRequest<LostReport>(`/lost-reports/${id}/close`, {
      method: "POST",
      body: JSON.stringify({ found }),
    }),
};
