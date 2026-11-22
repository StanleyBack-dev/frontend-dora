import "server-only";
import { backendGraphql } from "@/server/graphql/client";
import {
  createSupplierDocument,
  setSupplierActiveDocument,
  supplierFilterOptionsDocument,
  supplierOverviewDocument,
  suppliersDocument,
  updateSupplierDocument,
} from "@/server/graphql/operations/purchases.operations";
import type { Paginated } from "@/shared/contracts/api";
import type {
  Supplier,
  SupplierFilter,
  SupplierFilterOptions,
  SupplierInput,
  SupplierOverview,
} from "@/shared/contracts/purchases";

/** Which page of a list, and how many per page. */
type PageRequest = { page: number; limit: number };

export const purchasesService = {
  /** The condominium's suppliers, filtered by the API. */
  async suppliers(
    token: string,
    filter: SupplierFilter,
    page: PageRequest,
  ): Promise<Paginated<Supplier>> {
    const { suppliers } = await backendGraphql(suppliersDocument, {
      token,
      variables: { filter, page },
    });
    return suppliers;
  },

  /** What the list's filters offer (names, contacts, CNPJ/CPF in use). */
  async supplierFilterOptions(token: string): Promise<SupplierFilterOptions> {
    const { supplierFilterOptions } = await backendGraphql(
      supplierFilterOptionsDocument,
      { token },
    );
    return supplierFilterOptions;
  },

  /** The suppliers in numbers (the page's cards). */
  async supplierOverview(token: string): Promise<SupplierOverview> {
    const { supplierOverview } = await backendGraphql(
      supplierOverviewDocument,
      { token },
    );
    return supplierOverview;
  },

  async createSupplier(token: string, input: SupplierInput): Promise<Supplier> {
    const { createSupplier } = await backendGraphql(createSupplierDocument, {
      token,
      variables: { input },
    });
    return createSupplier;
  },

  async updateSupplier(
    token: string,
    id: string,
    input: SupplierInput,
  ): Promise<Supplier> {
    const { updateSupplier } = await backendGraphql(updateSupplierDocument, {
      token,
      variables: { id, input },
    });
    return updateSupplier;
  },

  async setSupplierActive(
    token: string,
    id: string,
    active: boolean,
  ): Promise<Supplier> {
    const { setSupplierActive } = await backendGraphql(
      setSupplierActiveDocument,
      { token, variables: { id, active } },
    );
    return setSupplierActive;
  },
};
