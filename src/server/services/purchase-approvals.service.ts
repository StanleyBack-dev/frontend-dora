import "server-only";
import { backendGraphql } from "@/server/graphql/client";
import {
  approvalBoardDocument,
  approvalBoardOverviewDocument,
  approvePurchaseDocument,
  purchaseApprovalsDocument,
  purchaseSettingsDocument,
  purchaseSummaryPdfDocument,
  rejectPurchaseDocument,
  returnPurchaseToQuotesDocument,
  updatePurchaseSettingsDocument,
} from "@/server/graphql/operations/purchase-approvals.operations";

import type { Paginated } from "@/shared/contracts/api";
import type {
  ApprovalMode,
  ApprovalOverview,
  PurchaseApproval,
  PurchaseSettings,
} from "@/shared/contracts/purchase-approvals";
import type { QuoteBoardRow } from "@/shared/contracts/purchase-quotes";
import type { PurchaseRequestFilter } from "@/shared/contracts/purchase-requests";

type PageRequest = { page: number; limit: number };

// The approval of the chosen quotes (aprovação por alçada): the settings,
// the approvals page, a request's decisions and the decisions themselves.
export const purchaseApprovalsService = {
  async settings(token: string): Promise<PurchaseSettings> {
    const { purchaseSettings } = await backendGraphql(
      purchaseSettingsDocument,
      { token },
    );
    return purchaseSettings;
  },

  async updateSettings(
    token: string,
    input: { approvalMode: ApprovalMode; approvalLimitCents: number | null },
  ): Promise<PurchaseSettings> {
    const { updatePurchaseSettings } = await backendGraphql(
      updatePurchaseSettingsDocument,
      { token, variables: { input } },
    );
    return updatePurchaseSettings;
  },

  /** A request's decisions, the latest first. */
  async history(token: string, requestId: string): Promise<PurchaseApproval[]> {
    const { purchaseApprovals } = await backendGraphql(
      purchaseApprovalsDocument,
      { token, variables: { requestId } },
    );
    return purchaseApprovals;
  },

  /** Waiting for approval, approved or rejected (filtered and paged by the API). */
  async board(
    token: string,
    filter: PurchaseRequestFilter,
    page: PageRequest,
  ): Promise<Paginated<QuoteBoardRow>> {
    const { approvalBoard } = await backendGraphql(approvalBoardDocument, {
      token,
      variables: { filter, page },
    });
    return approvalBoard;
  },

  async overview(token: string): Promise<ApprovalOverview> {
    const { approvalBoardOverview } = await backendGraphql(
      approvalBoardOverviewDocument,
      { token },
    );
    return approvalBoardOverview;
  },

  /** The purchase summary as a PDF. */
  async summaryPdf(
    token: string,
    requestId: string,
  ): Promise<{ fileName: string; mimeType: string; content: Buffer }> {
    const { purchaseSummaryPdf } = await backendGraphql(
      purchaseSummaryPdfDocument,
      { token, variables: { requestId } },
    );
    return {
      fileName: purchaseSummaryPdf.fileName,
      mimeType: purchaseSummaryPdf.mimeType,
      content: Buffer.from(purchaseSummaryPdf.base64Content, "base64"),
    };
  },

  async approve(token: string, requestId: string, note: string | null) {
    await backendGraphql(approvePurchaseDocument, {
      token,
      variables: { requestId, note },
    });
  },

  async returnToQuotes(token: string, requestId: string, reason: string) {
    await backendGraphql(returnPurchaseToQuotesDocument, {
      token,
      variables: { requestId, reason },
    });
  },

  async reject(token: string, requestId: string, reason: string) {
    await backendGraphql(rejectPurchaseDocument, {
      token,
      variables: { requestId, reason },
    });
  },
};
