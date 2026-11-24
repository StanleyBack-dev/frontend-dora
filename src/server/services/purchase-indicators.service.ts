import "server-only";
import { backendGraphql } from "@/server/graphql/client";
import {
  publishPurchaseTransparencyDocument,
  purchaseIndicatorsDocument,
  purchaseIndicatorsPdfDocument,
  purchaseTransparencyDocument,
  purchaseTransparencyPdfDocument,
  purchaseTransparencyStatusDocument,
} from "@/server/graphql/operations/purchase-indicators.operations";
import type { Paginated } from "@/shared/contracts/api";
import type {
  IndicatorPeriod,
  PurchaseIndicators,
  TransparencyPurchase,
  TransparencyStatus,
  TransparencySummary,
} from "@/shared/contracts/purchase-indicators";

type PageRequest = { page: number; limit: number };

export type ReportFile = {
  fileName: string;
  mimeType: string;
  content: Buffer;
};

const fileOf = (file: {
  fileName: string;
  mimeType: string;
  base64Content: string;
}): ReportFile => ({
  fileName: file.fileName,
  mimeType: file.mimeType,
  content: Buffer.from(file.base64Content, "base64"),
});

/**
 * The purchases in figures: the management's indicators and the residents'
 * accounts (prestação de contas), each also as a PDF, and publishing them.
 */
export const purchaseIndicatorsService = {
  async indicators(
    token: string,
    period: IndicatorPeriod,
  ): Promise<PurchaseIndicators> {
    const { purchaseIndicators } = await backendGraphql(
      purchaseIndicatorsDocument,
      { token, variables: { period } },
    );
    return purchaseIndicators;
  },

  async indicatorsPdf(
    token: string,
    period: IndicatorPeriod,
  ): Promise<ReportFile> {
    const { purchaseIndicatorsPdf } = await backendGraphql(
      purchaseIndicatorsPdfDocument,
      { token, variables: { period } },
    );
    return fileOf(purchaseIndicatorsPdf);
  },

  async transparencyStatus(token: string): Promise<TransparencyStatus> {
    const { purchaseTransparencyStatus } = await backendGraphql(
      purchaseTransparencyStatusDocument,
      { token },
    );
    return purchaseTransparencyStatus;
  },

  async transparency(
    token: string,
    period: IndicatorPeriod,
    page: PageRequest,
  ): Promise<{
    summary: TransparencySummary;
    purchases: Paginated<TransparencyPurchase>;
  }> {
    const { purchaseTransparency, transparencyPurchases } =
      await backendGraphql(purchaseTransparencyDocument, {
        token,
        variables: { period, page },
      });
    return { summary: purchaseTransparency, purchases: transparencyPurchases };
  },

  async transparencyPdf(
    token: string,
    period: IndicatorPeriod,
  ): Promise<ReportFile> {
    const { purchaseTransparencyPdf } = await backendGraphql(
      purchaseTransparencyPdfDocument,
      { token, variables: { period } },
    );
    return fileOf(purchaseTransparencyPdf);
  },

  async publish(token: string, enabled: boolean): Promise<TransparencyStatus> {
    const { publishPurchaseTransparency } = await backendGraphql(
      publishPurchaseTransparencyDocument,
      { token, variables: { enabled } },
    );
    return publishPurchaseTransparency;
  },
};
