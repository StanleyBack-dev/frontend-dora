import { apiRequest } from "@/shared/lib/api-client";
import type {
  Condominium,
  CondominiumInput,
  CondominiumStatus,
  CreateUnitsInput,
  Unit,
  UpdateUnitInput,
} from "@/shared/contracts/condominiums";

export const condominiumsClient = {
  /** null: leaves every condominium (platform view). */
  switchTo: (condominiumId: string | null) =>
    apiRequest<{ ok: true }>("/me/condominium", {
      method: "PUT",
      body: JSON.stringify({ condominiumId }),
    }),

  create: (input: CondominiumInput) =>
    apiRequest<Condominium>("/platform/condominiums", {
      method: "POST",
      body: JSON.stringify(input),
    }),

  update: (id: string, input: CondominiumInput) =>
    apiRequest<Condominium>(`/platform/condominiums/${id}`, {
      method: "PATCH",
      body: JSON.stringify(input),
    }),

  setStatus: (id: string, status: CondominiumStatus) =>
    apiRequest<Condominium>(`/platform/condominiums/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),

  createUnits: (input: CreateUnitsInput) =>
    apiRequest<Unit[]>("/units", {
      method: "POST",
      body: JSON.stringify(input),
    }),

  updateUnit: (id: string, input: UpdateUnitInput) =>
    apiRequest<Unit>(`/units/${id}`, {
      method: "PATCH",
      body: JSON.stringify(input),
    }),

  deleteUnit: (id: string) =>
    apiRequest<{ ok: true }>(`/units/${id}`, { method: "DELETE" }),
};
