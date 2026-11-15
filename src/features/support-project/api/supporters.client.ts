import { apiRequest } from "@/shared/lib/api-client";
import type {
  SupportContributionInput,
  SupporterInput,
} from "@/shared/contracts/supporters";

export const supportersClient = {
  record: (input: SupportContributionInput) =>
    apiRequest<{ ok: true }>("/supporters", {
      method: "POST",
      body: JSON.stringify(input),
    }),

  update: (id: string, input: SupporterInput) =>
    apiRequest<{ ok: true }>(`/supporters/${id}`, {
      method: "PATCH",
      body: JSON.stringify(input),
    }),

  remove: (id: string) =>
    apiRequest<{ ok: true }>(`/supporters/${id}`, { method: "DELETE" }),

  removeContribution: (id: string) =>
    apiRequest<{ ok: true }>(`/support-contributions/${id}`, {
      method: "DELETE",
    }),
};
