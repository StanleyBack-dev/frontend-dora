import { graphql } from "@/server/graphql/generated";

export const paymentBoardDocument = graphql(`
  query PaymentBoard($filter: PaymentFilterInput, $page: PageInput) {
    paymentBoard(filter: $filter, page: $page) {
      items {
        id
        number
        installmentCount
        amountCents
        dueOn
        paidOn
        paidByName
        proofUrl
        proofIsPdf
        note
        requestId
        requestNumber
        requestTitle
        orderNumber
        orderedAt
        supplierName
      }
      total
      page
      limit
      totalPages
    }
  }
`);

export const paymentBoardOverviewDocument = graphql(`
  query PaymentBoardOverview {
    paymentBoardOverview {
      openCents
      openCount
      overdueCents
      overdueCount
      dueSoonCents
      dueSoonCount
      paidThisMonthCents
      paidThisMonthCount
    }
  }
`);

export const reschedulePurchaseInstallmentDocument = graphql(`
  mutation ReschedulePurchaseInstallment(
    $requestId: ID!
    $installmentId: ID!
    $dueOn: String!
  ) {
    reschedulePurchaseInstallment(
      requestId: $requestId
      installmentId: $installmentId
      dueOn: $dueOn
    ) {
      ...PurchaseOrderViewFields
    }
  }
`);

export const payPurchaseInstallmentDocument = graphql(`
  mutation PayPurchaseInstallment(
    $requestId: ID!
    $installmentId: ID!
    $input: PurchasePaymentInput!
    $file: String
  ) {
    payPurchaseInstallment(
      requestId: $requestId
      installmentId: $installmentId
      input: $input
      file: $file
    ) {
      ...PurchaseOrderViewFields
    }
  }
`);

export const unpayPurchaseInstallmentDocument = graphql(`
  mutation UnpayPurchaseInstallment($requestId: ID!, $installmentId: ID!) {
    unpayPurchaseInstallment(
      requestId: $requestId
      installmentId: $installmentId
    ) {
      ...PurchaseOrderViewFields
    }
  }
`);
