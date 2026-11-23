import { graphql } from "@/server/graphql/generated";

export const purchaseSettingsDocument = graphql(`
  query PurchaseSettings {
    purchaseSettings {
      approvalMode
      approvalLimitCents
      updatedAt
      updatedByName
    }
  }
`);

export const updatePurchaseSettingsDocument = graphql(`
  mutation UpdatePurchaseSettings($input: PurchaseSettingsInput!) {
    updatePurchaseSettings(input: $input) {
      approvalMode
      approvalLimitCents
      updatedAt
      updatedByName
    }
  }
`);

export const purchaseApprovalsDocument = graphql(`
  query PurchaseApprovals($requestId: ID!) {
    purchaseApprovals(requestId: $requestId) {
      id
      decision
      supplierName
      totalCents
      limitCents
      note
      chosenByName
      decidedByName
      decidedAt
    }
  }
`);

export const approvalBoardDocument = graphql(`
  query ApprovalBoard($filter: PurchaseRequestFilterInput, $page: PageInput) {
    approvalBoard(filter: $filter, page: $page) {
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

export const approvalBoardOverviewDocument = graphql(`
  query ApprovalBoardOverview {
    approvalBoardOverview {
      awaiting
      approvedThisMonth
      returnedThisMonth
      rejectedThisMonth
    }
  }
`);

export const approvePurchaseDocument = graphql(`
  mutation ApprovePurchase($requestId: ID!, $note: String) {
    approvePurchase(requestId: $requestId, note: $note) {
      id
      status
    }
  }
`);

export const returnPurchaseToQuotesDocument = graphql(`
  mutation ReturnPurchaseToQuotes($requestId: ID!, $reason: String!) {
    returnPurchaseToQuotes(requestId: $requestId, reason: $reason) {
      id
      status
    }
  }
`);

export const rejectPurchaseDocument = graphql(`
  mutation RejectPurchase($requestId: ID!, $reason: String!) {
    rejectPurchase(requestId: $requestId, reason: $reason) {
      id
      status
    }
  }
`);

export const purchaseSummaryPdfDocument = graphql(`
  query PurchaseSummaryPdf($requestId: ID!) {
    purchaseSummaryPdf(requestId: $requestId) {
      fileName
      mimeType
      base64Content
    }
  }
`);
