import "server-only";
import { backendGraphql } from "@/server/graphql/client";
import {
  claimFoundItemDocument,
  decideFoundItemClaimDocument,
  discardFoundItemDocument,
  donateFoundItemDocument,
  foundItemDocument,
  foundItemClaimsDocument,
  foundItemOverviewDocument,
  foundItemOwnersDocument,
  foundItemReceiptPdfDocument,
  foundItemStaffDocument,
  foundItemsDocument,
  keptFoundItemsDocument,
  myFoundItemClaimsDocument,
  registerFoundItemDocument,
  releaseFoundItemDocument,
  returnFoundItemDocument,
  withdrawFoundItemClaimDocument,
} from "@/server/graphql/operations/lost-and-found.operations";
import type { Paginated } from "@/shared/contracts/api";
import type {
  ResidentOption,
  StaffOption,
} from "@/shared/contracts/residents-search";
import type {
  FoundItem,
  FoundItemCategory,
  FoundItemClaim,
  FoundItemDetails,
  FoundItemFilter,
  FoundItemOverview,
  KeptFoundItem,
  QueuedFoundItemClaim,
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

  /** The items still kept (what residents browse), with their claim. */
  async kept(
    token: string,
    category: FoundItemCategory | null,
    page: PageRequest,
  ): Promise<Paginated<KeptFoundItem>> {
    const { keptFoundItems } = await backendGraphql(keptFoundItemsDocument, {
      token,
      variables: { category, page },
    });
    return keptFoundItems;
  },

  /** The desk's claims: the open ones (a queue) or every claim. */
  async claims(
    token: string,
    open: boolean,
    page: PageRequest,
  ): Promise<Paginated<QueuedFoundItemClaim>> {
    const { foundItemClaims } = await backendGraphql(foundItemClaimsDocument, {
      token,
      variables: { open, page },
    });
    return foundItemClaims;
  },

  /** The caller's claims, newest first. */
  async myClaims(
    token: string,
    page: PageRequest,
  ): Promise<Paginated<FoundItemClaim>> {
    const { myFoundItemClaims } = await backendGraphql(
      myFoundItemClaimsDocument,
      { token, variables: { page } },
    );
    return myFoundItemClaims;
  },

  /** Says an item is the caller's (the desk is told). */
  async claim(
    token: string,
    itemId: string,
    message: string | null,
  ): Promise<FoundItemClaim> {
    const { claimFoundItem } = await backendGraphql(claimFoundItemDocument, {
      token,
      variables: { itemId, message },
    });
    return claimFoundItem;
  },

  /** Cancels one of the caller's claims still waiting. */
  async withdraw(token: string, claimId: string): Promise<FoundItemClaim> {
    const { withdrawFoundItemClaim } = await backendGraphql(
      withdrawFoundItemClaimDocument,
      { token, variables: { claimId } },
    );
    return withdrawFoundItemClaim;
  },

  /** Residents (with their unit) by part of the name, to name an owner. */
  async owners(token: string, search: string): Promise<ResidentOption[]> {
    const { foundItemOwners } = await backendGraphql(foundItemOwnersDocument, {
      token,
      variables: { search },
    });
    return foundItemOwners;
  },

  /** The team (gate, management), to name a staff member as owner. */
  async staff(token: string): Promise<StaffOption[]> {
    const { foundItemStaff } = await backendGraphql(foundItemStaffDocument, {
      token,
    });
    return foundItemStaff;
  },

  /** Lifts a reservation ("Não é meu", or the desk for everyone). */
  async release(token: string, id: string): Promise<FoundItem> {
    const { releaseFoundItem } = await backendGraphql(
      releaseFoundItemDocument,
      { token, variables: { id } },
    );
    return releaseFoundItem;
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

  /** The return receipt as a PDF file (the API checks who may see it). */
  async receiptPdf(
    token: string,
    id: string,
  ): Promise<{ fileName: string; mimeType: string; content: Buffer }> {
    const { foundItemReceiptPdf } = await backendGraphql(
      foundItemReceiptPdfDocument,
      { token, variables: { id } },
    );
    return {
      fileName: foundItemReceiptPdf.fileName,
      mimeType: foundItemReceiptPdf.mimeType,
      content: Buffer.from(foundItemReceiptPdf.base64Content, "base64"),
    };
  },
};
