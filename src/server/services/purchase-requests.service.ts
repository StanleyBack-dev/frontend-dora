import "server-only";
import { backendGraphql } from "@/server/graphql/client";
import {
  cancelPurchaseRequestDocument,
  createPurchaseRequestDocument,
  purchaseCatalogUsageDocument,
  purchaseRequestDocument,
  purchaseRequestFilterOptionsDocument,
  purchaseRequestOverviewDocument,
  purchaseRequestsDocument,
  updatePurchaseRequestDocument,
} from "@/server/graphql/operations/purchase-requests.operations";
import type { Paginated } from "@/shared/contracts/api";
import type {
  PurchaseCatalogUsage,
  PurchaseRequest,
  PurchaseRequestFilter,
  PurchaseRequestFilterOptions,
  PurchaseRequestInput,
  PurchaseRequestOverview,
} from "@/shared/contracts/purchase-requests";

/** Which page of a list, and how many per page. */
type PageRequest = { page: number; limit: number };

export const purchaseRequestsService = {
  /** The requests the caller sees, filtered by the API. */
  async list(
    token: string,
    filter: PurchaseRequestFilter,
    page: PageRequest,
  ): Promise<Paginated<PurchaseRequest>> {
    const { purchaseRequests } = await backendGraphql(
      purchaseRequestsDocument,
      { token, variables: { filter, page } },
    );
    return purchaseRequests;
  },

  async get(token: string, id: string): Promise<PurchaseRequest> {
    const { purchaseRequest } = await backendGraphql(purchaseRequestDocument, {
      token,
      variables: { id },
    });
    return purchaseRequest;
  },

  /** What the list's filters offer (requests and requesters in use). */
  async filterOptions(token: string): Promise<PurchaseRequestFilterOptions> {
    const { purchaseRequestFilterOptions } = await backendGraphql(
      purchaseRequestFilterOptionsDocument,
      { token },
    );
    return purchaseRequestFilterOptions;
  },

  /** The requests in numbers (the page's cards). */
  async overview(token: string): Promise<PurchaseRequestOverview> {
    const { purchaseRequestOverview } = await backendGraphql(
      purchaseRequestOverviewDocument,
      { token },
    );
    return purchaseRequestOverview;
  },

  /** How the catalog is used by the requests (the catalog pages' cards). */
  async catalogUsage(token: string): Promise<PurchaseCatalogUsage> {
    const { purchaseCatalogUsage } = await backendGraphql(
      purchaseCatalogUsageDocument,
      { token },
    );
    return purchaseCatalogUsage;
  },

  async create(
    token: string,
    input: PurchaseRequestInput,
  ): Promise<PurchaseRequest> {
    const { createPurchaseRequest } = await backendGraphql(
      createPurchaseRequestDocument,
      { token, variables: { input } },
    );
    return createPurchaseRequest;
  },

  async update(
    token: string,
    id: string,
    input: PurchaseRequestInput,
  ): Promise<PurchaseRequest> {
    const { updatePurchaseRequest } = await backendGraphql(
      updatePurchaseRequestDocument,
      { token, variables: { id, input } },
    );
    return updatePurchaseRequest;
  },

  async cancel(
    token: string,
    id: string,
    reason: string,
  ): Promise<PurchaseRequest> {
    const { cancelPurchaseRequest } = await backendGraphql(
      cancelPurchaseRequestDocument,
      { token, variables: { id, reason } },
    );
    return cancelPurchaseRequest;
  },
};
