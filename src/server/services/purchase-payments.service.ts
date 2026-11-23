import "server-only";
import { backendGraphql } from "@/server/graphql/client";
import {
  paymentBoardDocument,
  paymentBoardOverviewDocument,
  payPurchaseInstallmentDocument,
  reschedulePurchaseInstallmentDocument,
  unpayPurchaseInstallmentDocument,
} from "@/server/graphql/operations/purchase-payments.operations";
import type { Paginated } from "@/shared/contracts/api";
import type {
  PaymentBoardOverview,
  PaymentBoardRow,
  PaymentFilter,
  PaymentInput,
  PurchaseOrderView,
} from "@/shared/contracts/purchase-orders";

type PageRequest = { page: number; limit: number };

/**
 * The payments to the suppliers (contas a pagar): the installments of the
 * placed orders, paying them, undoing a payment and moving a due day.
 */
export const purchasePaymentsService = {
  async board(
    token: string,
    filter: PaymentFilter,
    page: PageRequest,
  ): Promise<Paginated<PaymentBoardRow>> {
    const { paymentBoard } = await backendGraphql(paymentBoardDocument, {
      token,
      variables: { filter, page },
    });
    return paymentBoard;
  },

  async overview(token: string): Promise<PaymentBoardOverview> {
    const { paymentBoardOverview } = await backendGraphql(
      paymentBoardOverviewDocument,
      { token },
    );
    return paymentBoardOverview;
  },

  async pay(
    token: string,
    requestId: string,
    installmentId: string,
    input: PaymentInput,
    file: string | null,
  ): Promise<PurchaseOrderView> {
    const { payPurchaseInstallment } = await backendGraphql(
      payPurchaseInstallmentDocument,
      { token, variables: { requestId, installmentId, input, file } },
    );
    return payPurchaseInstallment;
  },

  async unpay(
    token: string,
    requestId: string,
    installmentId: string,
  ): Promise<PurchaseOrderView> {
    const { unpayPurchaseInstallment } = await backendGraphql(
      unpayPurchaseInstallmentDocument,
      { token, variables: { requestId, installmentId } },
    );
    return unpayPurchaseInstallment;
  },

  async reschedule(
    token: string,
    requestId: string,
    installmentId: string,
    dueOn: string,
  ): Promise<PurchaseOrderView> {
    const { reschedulePurchaseInstallment } = await backendGraphql(
      reschedulePurchaseInstallmentDocument,
      { token, variables: { requestId, installmentId, dueOn } },
    );
    return reschedulePurchaseInstallment;
  },
};
