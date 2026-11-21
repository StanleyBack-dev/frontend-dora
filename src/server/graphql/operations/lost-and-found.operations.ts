import { graphql } from "@/server/graphql/generated";

export const foundItemFieldsFragment = graphql(`
  fragment FoundItemFields on FoundItem {
    id
    category
    title
    description
    foundLocation
    foundAt
    storageLocation
    photoHidden
    status
    registeredByName
    keepUntil
    closedAt
    closedByName
    closeReason
    returnedToName
    signerName
    pendingClaims
    photoUrl
  }
`);

export const foundItemClaimFieldsFragment = graphql(`
  fragment FoundItemClaimFields on FoundItemClaim {
    id
    itemId
    itemTitle
    itemStatus
    itemCategory
    userId
    userName
    unitLabel
    message
    status
    createdAt
    decidedAt
    decidedByName
    decisionNote
  }
`);

export const foundItemsDocument = graphql(`
  query FoundItems($filter: FoundItemFilterInput, $page: PageInput) {
    foundItems(filter: $filter, page: $page) {
      items {
        ...FoundItemFields
      }
      total
      page
      limit
      totalPages
    }
  }
`);

export const foundItemOverviewDocument = graphql(`
  query FoundItemOverview {
    foundItemOverview {
      byStatus {
        status
        count
      }
      pendingClaims
      expiringSoon
    }
  }
`);

export const foundItemDocument = graphql(`
  query FoundItem($id: ID!) {
    foundItem(id: $id) {
      ...FoundItemFields
      privateDetails
      claims {
        ...FoundItemClaimFields
      }
      returnDeclaration
      returnReceipt {
        signerName
        signerDocumentType
        signerDocumentMasked
        declaration
        imageUrl
        imageSha256
        strokesSha256
        signedAt
        clientSignedAt
        clientTimeZone
        ipAddress
        userAgent
        device
        locationStatus
        latitude
        longitude
        locationAccuracyMeters
        collectedByName
        collectedByRole
        evidenceSha256
        intact
      }
    }
  }
`);

export const registerFoundItemDocument = graphql(`
  mutation RegisterFoundItem($input: RegisterFoundItemInput!) {
    registerFoundItem(input: $input) {
      ...FoundItemFields
    }
  }
`);

export const decideFoundItemClaimDocument = graphql(`
  mutation DecideFoundItemClaim(
    $claimId: ID!
    $accept: Boolean!
    $note: String
  ) {
    decideFoundItemClaim(claimId: $claimId, accept: $accept, note: $note) {
      ...FoundItemClaimFields
    }
  }
`);

export const returnFoundItemDocument = graphql(`
  mutation ReturnFoundItem($input: ReturnFoundItemInput!) {
    returnFoundItem(input: $input) {
      ...FoundItemFields
    }
  }
`);

export const donateFoundItemDocument = graphql(`
  mutation DonateFoundItem($id: ID!, $reason: String!) {
    donateFoundItem(id: $id, reason: $reason) {
      ...FoundItemFields
    }
  }
`);

export const discardFoundItemDocument = graphql(`
  mutation DiscardFoundItem($id: ID!, $reason: String!) {
    discardFoundItem(id: $id, reason: $reason) {
      ...FoundItemFields
    }
  }
`);
