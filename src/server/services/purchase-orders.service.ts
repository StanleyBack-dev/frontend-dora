import "server-only";
import { backendGraphql } from "@/server/graphql/client";
import {
  cancelPurchaseOrderDocument,
  deliveryBoardOverviewDocument,
  orderBoardDocument,
  orderBoardOverviewDocument,
  placePurchaseOrderDocument,
  purchaseOrderDocument,
  purchaseOrderPdfDocument,
  ratePurchaseSupplierDocument,
  recordPurchaseReceiptDocument,
  removePurchaseReceiptDocument,
  sendPurchaseOrderByEmailDocument,
} from "@/server/graphql/operations/purchase-orders.operations";
import type { Paginated } from "@/shared/contracts/api";
import type {
  DeliveryBoardOverview,
  OrderBoardOverview,
  OrderBoardRow,
  PlaceOrderInput,
  PurchaseOrderView,
  ReceiptInput,
} from "@/shared/contracts/purchase-orders";
import type { PurchaseRequestFilter } from "@/shared/contracts/purchase-requests";

type PageRequest = { page: number; limit: number };

/**
 * After the approval: the orders and deliveries pages, a purchase's order
 * page, placing, sending and cancelling the order, the deliveries and the
 * supplier's rating.
 */
export const purchaseOrdersService = {
  /** Approved, ordered, received or completed (filtered and paged by the API). */
  async board(
    token: string,
    filter: PurchaseRequestFilter,
    page: PageRequest,
  ): Promise<Paginated<OrderBoardRow>> {
    const { orderBoard } = await backendGraphql(orderBoardDocument, {
      token,
      variables: { filter, page },
    });
    return orderBoard;
  },

  async overview(token: string): Promise<OrderBoardOverview> {
    const { orderBoardOverview } = await backendGraphql(
      orderBoardOverviewDocument,
      { token },
    );
    return orderBoardOverview;
  },

  async view(token: string, requestId: string): Promise<PurchaseOrderView> {
    const { purchaseOrder } = await backendGraphql(purchaseOrderDocument, {
      token,
      variables: { requestId },
    });
    return purchaseOrder;
  },

  /** The purchase order as a PDF. */
  async pdf(
    token: string,
    requestId: string,
  ): Promise<{ fileName: string; mimeType: string; content: Buffer }> {
    const { purchaseOrderPdf } = await backendGraphql(
      purchaseOrderPdfDocument,
      { token, variables: { requestId } },
    );
    return {
      fileName: purchaseOrderPdf.fileName,
      mimeType: purchaseOrderPdf.mimeType,
      content: Buffer.from(purchaseOrderPdf.base64Content, "base64"),
    };
  },

  async place(
    token: string,
    requestId: string,
    input: PlaceOrderInput,
  ): Promise<PurchaseOrderView> {
    const { placePurchaseOrder } = await backendGraphql(
      placePurchaseOrderDocument,
      { token, variables: { requestId, input } },
    );
    return placePurchaseOrder;
  },

  async addReceipt(
    token: string,
    requestId: string,
    input: ReceiptInput,
    file: string | null,
  ): Promise<PurchaseOrderView> {
    const { recordPurchaseReceipt } = await backendGraphql(
      recordPurchaseReceiptDocument,
      { token, variables: { requestId, input, file } },
    );
    return recordPurchaseReceipt;
  },

  async removeReceipt(
    token: string,
    requestId: string,
    receiptId: string,
  ): Promise<PurchaseOrderView> {
    const { removePurchaseReceipt } = await backendGraphql(
      removePurchaseReceiptDocument,
      { token, variables: { requestId, receiptId } },
    );
    return removePurchaseReceipt;
  },

  async rate(
    token: string,
    requestId: string,
    rating: number,
    comment: string | null,
  ): Promise<PurchaseOrderView> {
    const { ratePurchaseSupplier } = await backendGraphql(
      ratePurchaseSupplierDocument,
      { token, variables: { requestId, rating, comment } },
    );
    return ratePurchaseSupplier;
  },

  async deliveryOverview(token: string): Promise<DeliveryBoardOverview> {
    const { deliveryBoardOverview } = await backendGraphql(
      deliveryBoardOverviewDocument,
      { token },
    );
    return deliveryBoardOverview;
  },

  async cancel(
    token: string,
    requestId: string,
    reason: string,
    backToQuotes: boolean,
  ): Promise<PurchaseOrderView | null> {
    const { cancelPurchaseOrder } = await backendGraphql(
      cancelPurchaseOrderDocument,
      { token, variables: { requestId, reason, backToQuotes } },
    );
    return cancelPurchaseOrder;
  },

  /** Sends the purchase order by e-mail; how many e-mails went out. */
  async sendByEmail(
    token: string,
    requestId: string,
    input: { emails: string[]; message: string },
  ): Promise<number> {
    const { sendPurchaseOrderByEmail } = await backendGraphql(
      sendPurchaseOrderByEmailDocument,
      { token, variables: { requestId, input } },
    );
    return sendPurchaseOrderByEmail;
  },
};
