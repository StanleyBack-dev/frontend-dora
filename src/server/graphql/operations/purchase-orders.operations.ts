import { graphql } from "@/server/graphql/generated";

export const purchaseOrderViewFragment = graphql(`
  fragment PurchaseOrderViewFields on PurchaseOrderView {
    request {
      ...PurchaseRequestFields
    }
    order {
      id
      number
      supplierName
      supplierEmail
      supplierPhone
      itemsCents
      totalCents
      paymentMethod
      paymentTerms
      expectedOn
      notes
      orderedByName
      orderedAt
      completedAt
      receipts {
        id
        receivedOn
        items {
          requestItemId
          quantity
        }
        invoiceNumber
        invoiceCents
        invoiceDate
        fileUrl
        fileIsPdf
        note
        receivedById
        receivedByName
        createdAt
      }
      installments {
        id
        number
        amountCents
        dueOn
        paidOn
        paidByName
        proofUrl
        proofIsPdf
        note
      }
      rating {
        rating
        comment
        ratedByName
        ratedAt
      }
    }
    lines {
      requestItemId
      productName
      brandName
      note
      unit
      quantity
      received
      pending
      unitPriceCents
      lineCents
    }
    plan {
      supplierName
      itemsCents
      totalCents
      paymentMethod
      paymentTerms
      deliveryDays
      installmentValues
    }
    cancelledOrders {
      number
      supplierName
      totalCents
      orderedAt
      cancelledAt
      cancelledByName
      reason
    }
    canManage
    canSeeMoney
  }
`);

export const purchaseOrderDocument = graphql(`
  query PurchaseOrder($requestId: ID!) {
    purchaseOrder(requestId: $requestId) {
      ...PurchaseOrderViewFields
    }
  }
`);

export const orderBoardDocument = graphql(`
  query OrderBoard($filter: PurchaseRequestFilterInput, $page: PageInput) {
    orderBoard(filter: $filter, page: $page) {
      items {
        request {
          ...PurchaseRequestFields
        }
        orderNumber
        supplierName
        totalCents
        expectedOn
        itemsReceived
        itemCount
        receiptCount
        installmentsPaid
        installmentCount
        nextDueOn
      }
      total
      page
      limit
      totalPages
    }
  }
`);

export const orderBoardOverviewDocument = graphql(`
  query OrderBoardOverview {
    orderBoardOverview {
      toOrder
      awaitingDelivery
      unpaidInstallments
      unpaidCents
      overdueInstallments
      completedThisMonth
    }
  }
`);

export const purchaseOrderPdfDocument = graphql(`
  query PurchaseOrderPdf($requestId: ID!) {
    purchaseOrderPdf(requestId: $requestId) {
      fileName
      mimeType
      base64Content
    }
  }
`);

export const placePurchaseOrderDocument = graphql(`
  mutation PlacePurchaseOrder(
    $requestId: ID!
    $input: PlacePurchaseOrderInput!
  ) {
    placePurchaseOrder(requestId: $requestId, input: $input) {
      ...PurchaseOrderViewFields
    }
  }
`);

export const recordPurchaseReceiptDocument = graphql(`
  mutation RecordPurchaseReceipt(
    $requestId: ID!
    $input: PurchaseReceiptInput!
    $file: String
  ) {
    recordPurchaseReceipt(requestId: $requestId, input: $input, file: $file) {
      ...PurchaseOrderViewFields
    }
  }
`);

export const removePurchaseReceiptDocument = graphql(`
  mutation RemovePurchaseReceipt($requestId: ID!, $receiptId: ID!) {
    removePurchaseReceipt(requestId: $requestId, receiptId: $receiptId) {
      ...PurchaseOrderViewFields
    }
  }
`);

export const ratePurchaseSupplierDocument = graphql(`
  mutation RatePurchaseSupplier(
    $requestId: ID!
    $rating: Int!
    $comment: String
  ) {
    ratePurchaseSupplier(
      requestId: $requestId
      rating: $rating
      comment: $comment
    ) {
      ...PurchaseOrderViewFields
    }
  }
`);

export const deliveryBoardOverviewDocument = graphql(`
  query DeliveryBoardOverview {
    deliveryBoardOverview {
      awaitingDelivery
      lateDeliveries
      partialDeliveries
      receiptsThisMonth
    }
  }
`);

export const cancelPurchaseOrderDocument = graphql(`
  mutation CancelPurchaseOrder(
    $requestId: ID!
    $reason: String!
    $backToQuotes: Boolean!
  ) {
    cancelPurchaseOrder(
      requestId: $requestId
      reason: $reason
      backToQuotes: $backToQuotes
    ) {
      ...PurchaseOrderViewFields
    }
  }
`);

export const sendPurchaseOrderByEmailDocument = graphql(`
  mutation SendPurchaseOrderByEmail(
    $requestId: ID!
    $input: PurchaseEmailInput!
  ) {
    sendPurchaseOrderByEmail(requestId: $requestId, input: $input)
  }
`);
