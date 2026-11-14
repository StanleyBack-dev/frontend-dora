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

  addPhoto: (spaceId: string, photo: string) =>
    apiRequest<Space>(`/spaces/${spaceId}/photos`, {
      method: "POST",
      body: JSON.stringify({ photo }),
    }),

  removePhoto: (spaceId: string, photoId: string) =>
    apiRequest<Space>(`/spaces/${spaceId}/photos/${photoId}`, {
      method: "DELETE",
    }),

  remove: (id: string) =>
    apiRequest<{ ok: true }>(`/spaces/${id}`, { method: "DELETE" }),
};
