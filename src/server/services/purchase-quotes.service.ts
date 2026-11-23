import "server-only";
import { backendGraphql } from "@/server/graphql/client";
import {
  quoteBoardDocument,
  quoteBoardOverviewDocument,
  addPurchaseQuoteDocument,
  choosePurchaseQuoteDocument,
  purchaseQuoteMapPdfDocument,
  purchaseQuotesDocument,
  removePurchaseQuoteDocument,
  reopenPurchaseQuotesDocument,
  sharePurchaseQuoteMapByEmailDocument,
  updatePurchaseQuoteDocument,
} from "@/server/graphql/operations/purchase-quotes.operations";
import type { Paginated } from "@/shared/contracts/api";
import type { PurchaseRequestFilter } from "@/shared/contracts/purchase-requests";
import type {
  QuoteBoardOverview,
  QuoteBoardRow,
  PurchaseQuote,
  PurchaseQuoteInput,
} from "@/shared/contracts/purchase-quotes";

/** Which page of a list, and how many per page. */
type PageRequest = { page: number; limit: number };

export const purchaseQuotesService = {
  /** The requests in the quote stages, filtered and paged by the API. */
  async board(
    token: string,
    filter: PurchaseRequestFilter,
    page: PageRequest,
  ): Promise<Paginated<QuoteBoardRow>> {
    const { quoteBoard } = await backendGraphql(quoteBoardDocument, {
      token,
      variables: { filter, page },
    });
    return quoteBoard;
  },

  /** The quotes page's cards. */
  async boardOverview(token: string): Promise<QuoteBoardOverview> {
    const { quoteBoardOverview } = await backendGraphql(
      quoteBoardOverviewDocument,
      { token },
    );
    return quoteBoardOverview;
  },

  /** A request's quotes with totals, the cheapest and the chosen one. */
  async list(token: string, requestId: string): Promise<PurchaseQuote[]> {
    const { purchaseQuotes } = await backendGraphql(purchaseQuotesDocument, {
      token,
      variables: { requestId },
    });
    return purchaseQuotes;
  },

  /** The comparison map as a PDF. */
  async mapPdf(
    token: string,
    requestId: string,
  ): Promise<{ fileName: string; mimeType: string; content: Buffer }> {
    const { purchaseQuoteMapPdf } = await backendGraphql(
      purchaseQuoteMapPdfDocument,
      { token, variables: { requestId } },
    );
    return {
      fileName: purchaseQuoteMapPdf.fileName,
      mimeType: purchaseQuoteMapPdf.mimeType,
      content: Buffer.from(purchaseQuoteMapPdf.base64Content, "base64"),
    };
  },

  async add(
    token: string,
    requestId: string,
    supplierId: string,
    input: PurchaseQuoteInput,
    file: string | null,
  ): Promise<PurchaseQuote> {
    const { addPurchaseQuote } = await backendGraphql(
      addPurchaseQuoteDocument,
      { token, variables: { requestId, supplierId, input, file } },
    );
    return addPurchaseQuote;
  },

  async update(
    token: string,
    id: string,
    input: PurchaseQuoteInput,
    file: string | null,
    removeFile: boolean,
  ): Promise<PurchaseQuote> {
    const { updatePurchaseQuote } = await backendGraphql(
      updatePurchaseQuoteDocument,
      { token, variables: { id, input, file, removeFile } },
    );
    return updatePurchaseQuote;
  },

  async remove(token: string, id: string): Promise<void> {
    await backendGraphql(removePurchaseQuoteDocument, {
      token,
      variables: { id },
    });
  },

  async choose(
    token: string,
    id: string,
    justification: string | null,
  ): Promise<void> {
    await backendGraphql(choosePurchaseQuoteDocument, {
      token,
      variables: { id, justification },
    });
  },

  /** Sends the map PDF by e-mail; how many were sent. */
  async shareMapByEmail(
    token: string,
    requestId: string,
    input: { emails: string[]; message: string },
  ): Promise<number> {
    const { sharePurchaseQuoteMapByEmail } = await backendGraphql(
      sharePurchaseQuoteMapByEmailDocument,
      { token, variables: { requestId, input } },
    );
    return sharePurchaseQuoteMapByEmail;
  },

  async reopen(token: string, requestId: string): Promise<void> {
    await backendGraphql(reopenPurchaseQuotesDocument, {
      token,
      variables: { requestId },
    });
  },
};
