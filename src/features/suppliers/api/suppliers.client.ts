import { apiRequest } from "@/shared/lib/api-client";
import type { Supplier, SupplierInput } from "@/shared/contracts/suppliers";

export const suppliersClient = {
  createSupplier: (input: SupplierInput) =>
    apiRequest<Supplier>("/suppliers", {
      method: "POST",
      body: JSON.stringify(input),
    }),

  updateSupplier: (id: string, input: SupplierInput) =>
    apiRequest<Supplier>(`/suppliers/${id}`, {
      method: "PUT",
      body: JSON.stringify(input),
    }),

  setSupplierActive: (id: string, active: boolean) =>
    apiRequest<Supplier>(`/suppliers/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ active }),
    }),
};
