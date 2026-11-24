import "server-only";
import { backendGraphql } from "@/server/graphql/client";
import {
  brandCountsDocument,
  brandOptionsDocument,
  brandsDocument,
  createBrandDocument,
  createProductDocument,
  productCountsDocument,
  productOptionsDocument,
  productsDocument,
  renameBrandDocument,
  setBrandActiveDocument,
  setProductActiveDocument,
  updateProductDocument,
} from "@/server/graphql/operations/catalog.operations";
import type { Paginated } from "@/shared/contracts/api";
import type {
  Brand,
  CatalogCounts,
  CatalogFilter,
  CatalogOption,
  Product,
  ProductInput,
} from "@/shared/contracts/catalog";

/** Which page of a list, and how many per page. */
type PageRequest = { page: number; limit: number };

export const catalogService = {
  async products(
    token: string,
    filter: CatalogFilter,
    page: PageRequest,
  ): Promise<Paginated<Product>> {
    const { products } = await backendGraphql(productsDocument, {
      token,
      variables: { filter, page },
    });
    return products;
  },

  async productOptions(token: string): Promise<CatalogOption[]> {
    const { productOptions } = await backendGraphql(productOptionsDocument, {
      token,
    });
    return productOptions;
  },

  async productCounts(token: string): Promise<CatalogCounts> {
    const { productCounts } = await backendGraphql(productCountsDocument, {
      token,
    });
    return productCounts;
  },

  async createProduct(token: string, input: ProductInput): Promise<Product> {
    const { createProduct } = await backendGraphql(createProductDocument, {
      token,
      variables: { input },
    });
    return createProduct;
  },

  async updateProduct(
    token: string,
    id: string,
    input: ProductInput,
  ): Promise<Product> {
    const { updateProduct } = await backendGraphql(updateProductDocument, {
      token,
      variables: { id, input },
    });
    return updateProduct;
  },

  async setProductActive(
    token: string,
    id: string,
    active: boolean,
  ): Promise<Product> {
    const { setProductActive } = await backendGraphql(
      setProductActiveDocument,
      { token, variables: { id, active } },
    );
    return setProductActive;
  },

  async brands(
    token: string,
    filter: CatalogFilter,
    page: PageRequest,
  ): Promise<Paginated<Brand>> {
    const { brands } = await backendGraphql(brandsDocument, {
      token,
      variables: { filter, page },
    });
    return brands;
  },

  async brandOptions(token: string): Promise<CatalogOption[]> {
    const { brandOptions } = await backendGraphql(brandOptionsDocument, {
      token,
    });
    return brandOptions;
  },

  async brandCounts(token: string): Promise<CatalogCounts> {
    const { brandCounts } = await backendGraphql(brandCountsDocument, {
      token,
    });
    return brandCounts;
  },

  async createBrand(token: string, name: string): Promise<Brand> {
    const { createBrand } = await backendGraphql(createBrandDocument, {
      token,
      variables: { name },
    });
    return createBrand;
  },

  async renameBrand(token: string, id: string, name: string): Promise<Brand> {
    const { renameBrand } = await backendGraphql(renameBrandDocument, {
      token,
      variables: { id, name },
    });
    return renameBrand;
  },

  async setBrandActive(
    token: string,
    id: string,
    active: boolean,
  ): Promise<Brand> {
    const { setBrandActive } = await backendGraphql(setBrandActiveDocument, {
      token,
      variables: { id, active },
    });
    return setBrandActive;
  },
};
