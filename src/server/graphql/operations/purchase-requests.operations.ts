import { graphql } from "@/server/graphql/generated";

export const purchaseRequestFieldsFragment = graphql(`
  fragment PurchaseRequestFields on PurchaseRequest {
    id
    number
    title
    description
    categories
    categoryOther
    priority
    spaceId
    location
    neededBy
    status
    requestedById
    requestedByName
    items {
      id
      productId
      productName
      quantity
      unit
      brandId
      brandName
      note
    }
    quoteCount
    chosenQuoteId
    choiceJustification
    chosenAt
    cancelReason
    cancelledAt
    createdAt
    updatedAt
  }
`);

export const purchaseRequestsDocument = graphql(`
  query PurchaseRequests(
    $filter: PurchaseRequestFilterInput
    $page: PageInput
  ) {
    purchaseRequests(filter: $filter, page: $page) {
      items {
        ...PurchaseRequestFields
      }
      total
      page
      limit
      totalPages
    }
  }
`);

export const purchaseRequestDocument = graphql(`
  query PurchaseRequest($id: ID!) {
    purchaseRequest(id: $id) {
      ...PurchaseRequestFields
    }
  }
`);

export const purchaseRequestFilterOptionsDocument = graphql(`
  query PurchaseRequestFilterOptions {
    purchaseRequestFilterOptions {
      requests {
        id
        number
        title
      }
      requesters {
        id
        name
      }
    }
  }
`);

export const purchaseRequestOverviewDocument = graphql(`
  query PurchaseRequestOverview {
    purchaseRequestOverview {
      open
      urgent
      dueSoon
      overdue
    }
  }
`);

export const createPurchaseRequestDocument = graphql(`
  mutation CreatePurchaseRequest($input: PurchaseRequestInput!) {
    createPurchaseRequest(input: $input) {
      ...PurchaseRequestFields
    }
  }
`);

export const updatePurchaseRequestDocument = graphql(`
  mutation UpdatePurchaseRequest($id: ID!, $input: PurchaseRequestInput!) {
    updatePurchaseRequest(id: $id, input: $input) {
      ...PurchaseRequestFields
    }
  }
`);

export const cancelPurchaseRequestDocument = graphql(`
  mutation CancelPurchaseRequest($id: ID!, $reason: String!) {
    cancelPurchaseRequest(id: $id, reason: $reason) {
      ...PurchaseRequestFields
    }
  }
`);

export const purchaseCatalogUsageDocument = graphql(`
  query PurchaseCatalogUsage {
    purchaseCatalogUsage {
      productsInUse
      topProduct {
        name
        requestCount
      }
      brandsInUse
      topBrand {
        name
        requestCount
      }
    }
  }
`);
