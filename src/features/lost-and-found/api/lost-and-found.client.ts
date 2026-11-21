import { apiRequest } from "@/shared/lib/api-client";
import type {
  FoundItem,
  FoundItemClaim,
  RegisterFoundItemInput,
  ReturnFoundItemInput,
} from "@/shared/contracts/lost-and-found";

export const lostAndFoundClient = {
  register: (input: RegisterFoundItemInput) =>
    apiRequest<FoundItem>("/lost-and-found", {
      method: "POST",
      body: JSON.stringify(input),
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
};
