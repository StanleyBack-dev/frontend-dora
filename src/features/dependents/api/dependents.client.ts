import { apiRequest } from "@/shared/lib/api-client";
import type { Dependent, DependentInput } from "@/shared/contracts/dependents";

export const dependentsClient = {
  add: (input: DependentInput) =>
    apiRequest<Dependent>("/dependents", {
      method: "POST",
      body: JSON.stringify(input),
    }),

  remove: (id: string) =>
    apiRequest<{ ok: true }>(`/dependents/${id}`, { method: "DELETE" }),

  approve: (id: string) =>
    apiRequest<Dependent>(`/admin/dependents/${id}/approve`, {
      method: "POST",
    }),

  reject: (id: string, reason: string) =>
    apiRequest<Dependent>(`/admin/dependents/${id}/reject`, {
      method: "POST",
      body: JSON.stringify({ reason }),
    }),
};
