import "server-only";
import { backendGraphql } from "@/server/graphql/client";
import {
  decideFoundItemClaimDocument,
  discardFoundItemDocument,
  donateFoundItemDocument,
  foundItemDocument,
  foundItemOverviewDocument,
  foundItemsDocument,
  registerFoundItemDocument,
  returnFoundItemDocument,
} from "@/server/graphql/operations/lost-and-found.operations";
import type { Paginated } from "@/shared/contracts/api";
import type {
  FoundItem,
  FoundItemClaim,
  FoundItemDetails,
  FoundItemFilter,
  FoundItemOverview,
  RegisterFoundItemInput,
  ReturnFoundItemInput,
} from "@/shared/contracts/lost-and-found";

/** Which page of a list, and how many per page. */
type PageRequest = { page: number; limit: number };

export const lostAndFoundService = {
  /** The condominium's found items (desk), filtered by the API. */
  async list(
    token: string,
    filter: FoundItemFilter,
    page: PageRequest,
  ): Promise<Paginated<FoundItem>> {
    const { foundItems } = await backendGraphql(foundItemsDocument, {
      token,
      variables: { filter, page },
    });
    return foundItems;
  },

  async overview(token: string): Promise<FoundItemOverview> {
    const { foundItemOverview } = await backendGraphql(
      foundItemOverviewDocument,
      { token },
    );
    return foundItemOverview;
  },

  /** One item with what the caller may see (the API checks it). */
  async get(token: string, id: string): Promise<FoundItemDetails> {
    const { foundItem } = await backendGraphql(foundItemDocument, {
      token,
      variables: { id },
    });
    return foundItem;
  },

  async register(
    token: string,
    input: RegisterFoundItemInput,
  ): Promise<FoundItem> {
    const { registerFoundItem } = await backendGraphql(
      registerFoundItemDocument,
      { token, variables: { input } },
    );
    return registerFoundItem;
  },

  /** Accepts a claim (come and take it) or rejects it (with the reason). */
  async decide(
    token: string,
    claimId: string,
    accept: boolean,
    note: string | null,
  ): Promise<FoundItemClaim> {
    const { decideFoundItemClaim } = await backendGraphql(
      decideFoundItemClaimDocument,
      { token, variables: { claimId, accept, note } },
    );
    return decideFoundItemClaim;
  },

  async returnItem(
    token: string,
    itemId: string,
    input: ReturnFoundItemInput,
  ): Promise<FoundItem> {
    const { returnFoundItem } = await backendGraphql(returnFoundItemDocument, {
      token,
      variables: { input: { itemId, ...input } },
    });
    return returnFoundItem;
  },

  async donate(token: string, id: string, reason: string): Promise<FoundItem> {
    const { donateFoundItem } = await backendGraphql(donateFoundItemDocument, {
      token,
      variables: { id, reason },
    });
    return donateFoundItem;
  },

  async discard(token: string, id: string, reason: string): Promise<FoundItem> {
    const { discardFoundItem } = await backendGraphql(
      discardFoundItemDocument,
      { token, variables: { id, reason } },
    );
    return discardFoundItem;
  },
};
