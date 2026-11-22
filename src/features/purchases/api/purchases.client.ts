import { apiRequest } from "@/shared/lib/api-client";
import type { Supplier, SupplierInput } from "@/shared/contracts/purchases";

export const purchasesClient = {
  createSupplier: (input: SupplierInput) =>
    apiRequest<Supplier>("/purchases/suppliers", {
      method: "POST",
      body: JSON.stringify(input),
    }),

  updateSupplier: (id: string, input: SupplierInput) =>
    apiRequest<Supplier>(`/purchases/suppliers/${id}`, {
      method: "PUT",
      body: JSON.stringify(input),
    }),

  setSupplierActive: (id: string, active: boolean) =>
    apiRequest<Supplier>(`/purchases/suppliers/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ active }),
    }),
};
