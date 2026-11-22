import { apiRequest } from "@/shared/lib/api-client";
import type { Brand, Product, ProductInput } from "@/shared/contracts/catalog";

export const catalogClient = {
  createProduct: (input: ProductInput) =>
    apiRequest<Product>("/catalog/products", {
      method: "POST",
      body: JSON.stringify(input),
    }),

  updateProduct: (id: string, input: ProductInput) =>
    apiRequest<Product>(`/catalog/products/${id}`, {
      method: "PUT",
      body: JSON.stringify(input),
    }),

  setProductActive: (id: string, active: boolean) =>
    apiRequest<Product>(`/catalog/products/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ active }),
    }),

  createBrand: (name: string) =>
    apiRequest<Brand>("/catalog/brands", {
      method: "POST",
      body: JSON.stringify({ name }),
    }),

  renameBrand: (id: string, name: string) =>
    apiRequest<Brand>(`/catalog/brands/${id}`, {
      method: "PUT",
      body: JSON.stringify({ name }),
    }),

  setBrandActive: (id: string, active: boolean) =>
    apiRequest<Brand>(`/catalog/brands/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ active }),
    }),
};
