import { graphql } from "@/server/graphql/generated";

export const purchaseQuoteFieldsFragment = graphql(`
  fragment PurchaseQuoteFields on PurchaseQuote {
    id
    supplierId
    supplierName
    lines {
      requestItemId
      unitPriceCents
      lineCents
    }
    shippingCents
    charges {
      label
      amountCents
    }
    chargesCents
    discountCents
    discountPercentBp
    interestRateBp
    itemsCents
    cashCents
    totalCents
    interestCents
    installmentValues
    complete
    cheapest
    chosen
    deliveryDays
    paymentMethod
    installments
    paymentTerms
    validUntil
    notes
    fileUrl
    fileIsPdf
    createdAt
  }
`);

export const purchaseQuotesDocument = graphql(`
  query PurchaseQuotes($requestId: ID!) {
    purchaseQuotes(requestId: $requestId) {
      ...PurchaseQuoteFields
    }
  }
`);

export const purchaseQuoteMapPdfDocument = graphql(`
  query PurchaseQuoteMapPdf($requestId: ID!) {
    purchaseQuoteMapPdf(requestId: $requestId) {
      fileName
      mimeType
      base64Content
    }
  }
`);

export const addPurchaseQuoteDocument = graphql(`
  mutation AddPurchaseQuote(
    $requestId: ID!
    $supplierId: ID!
    $input: PurchaseQuoteInput!
    $file: String
  ) {
    addPurchaseQuote(
      requestId: $requestId
      supplierId: $supplierId
      input: $input
      file: $file
    ) {
      ...PurchaseQuoteFields
    }
  }
`);

export const updatePurchaseQuoteDocument = graphql(`
  mutation UpdatePurchaseQuote(
    $id: ID!
    $input: PurchaseQuoteInput!
    $file: String
    $removeFile: Boolean
  ) {
    updatePurchaseQuote(
      id: $id
      input: $input
      file: $file
      removeFile: $removeFile
    ) {
      ...PurchaseQuoteFields
    }
  }
`);

export const removePurchaseQuoteDocument = graphql(`
  mutation RemovePurchaseQuote($id: ID!) {
    removePurchaseQuote(id: $id)
  }
`);

export const choosePurchaseQuoteDocument = graphql(`
  mutation ChoosePurchaseQuote($id: ID!, $justification: String) {
    choosePurchaseQuote(id: $id, justification: $justification) {
      id
      status
    }
  }
`);

export const reopenPurchaseQuotesDocument = graphql(`
  mutation ReopenPurchaseQuotes($requestId: ID!) {
    reopenPurchaseQuotes(requestId: $requestId) {
      id
      status
    }
  }
`);

export const sharePurchaseQuoteMapByEmailDocument = graphql(`
  mutation SharePurchaseQuoteMapByEmail(
    $requestId: ID!
    $input: PurchaseEmailInput!
  ) {
    sharePurchaseQuoteMapByEmail(requestId: $requestId, input: $input)
  }
`);

export const quoteBoardDocument = graphql(`
  query QuoteBoard($filter: PurchaseRequestFilterInput, $page: PageInput) {
    quoteBoard(filter: $filter, page: $page) {
      items {
        request {
          ...PurchaseRequestFields
        }
        quoteCount
        completeCount
        cheapest {
          supplierName
          totalCents
        }
        chosen {
          supplierName
          totalCents
        }
      }
      total
      page
      limit
      totalPages
    }
  }
`);

export const quoteBoardOverviewDocument = graphql(`
  query QuoteBoardOverview {
    quoteBoardOverview {
      awaitingQuotes
      quoting
      belowMinimum
      awaitingApproval
    }
  }
`);
