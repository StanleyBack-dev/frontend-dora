import { apiRequest } from "@/shared/lib/api-client";
import type { Space, SpaceInput } from "@/shared/contracts/spaces";

export const spacesClient = {
  create: (input: SpaceInput) =>
    apiRequest<Space>("/spaces", {
      method: "POST",
      body: JSON.stringify(input),
    }),

  update: (id: string, input: SpaceInput) =>
    apiRequest<Space>(`/spaces/${id}`, {
      method: "PUT",
      body: JSON.stringify(input),
    }),

  setActive: (id: string, active: boolean) =>
    apiRequest<Space>(`/spaces/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ active }),
    }),

  remove: (id: string) =>
    apiRequest<{ ok: true }>(`/spaces/${id}`, { method: "DELETE" }),
};
