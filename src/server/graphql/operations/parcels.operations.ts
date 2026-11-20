import { graphql } from "@/server/graphql/generated";

export const parcelFieldsFragment = graphql(`
  fragment ParcelFields on Parcel {
    id
    unitId
    unitLabel
    recipientName
    recipientOnly
    carrier
    trackingCode
    notes
    storageLocation
    pickupCode
    status
    receivedAt
    receivedByName
    closedAt
    closedByName
    closeReason
    signerName
    photoUrl
  }
`);

export const parcelsDocument = graphql(`
  query Parcels($filter: ParcelFilterInput, $page: PageInput) {
    parcels(filter: $filter, page: $page) {
      items {
        ...ParcelFields
      }
      total
      page
      limit
      totalPages
    }
  }
`);

export const parcelOverviewDocument = graphql(`
  query ParcelOverview {
    parcelOverview {
      byStatus {
        status
        count
      }
      waitingLong
      units {
        id
        label
      }
      recipientNames
      carriers
      trackingCodes
    }
  }
`);

export const parcelByCodeDocument = graphql(`
  query ParcelByCode($code: String!) {
    parcelByCode(code: $code) {
      ...ParcelFields
      pickupDeclaration
    }
  }
`);

export const registerParcelDocument = graphql(`
  mutation RegisterParcel($input: RegisterParcelInput!) {
    registerParcel(input: $input) {
      ...ParcelFields
    }
  }
`);

export const pickUpParcelDocument = graphql(`
  mutation PickUpParcel($input: PickUpParcelInput!) {
    pickUpParcel(input: $input) {
      ...ParcelFields
    }
  }
`);

export const returnParcelDocument = graphql(`
  mutation ReturnParcel($id: ID!, $reason: String!) {
    returnParcel(id: $id, reason: $reason) {
      ...ParcelFields
    }
  }
`);

export const cancelParcelDocument = graphql(`
  mutation CancelParcel($id: ID!, $reason: String!) {
    cancelParcel(id: $id, reason: $reason) {
      ...ParcelFields
    }
  }
`);

export const parcelRecipientsDocument = graphql(`
  query ParcelRecipients($search: String!) {
    parcelRecipients(search: $search) {
      userId
      name
      unitId
      unitLabel
    }
  }
`);

export const myParcelsDocument = graphql(`
  query MyParcels($statuses: [ParcelStatus!], $page: PageInput) {
    myParcels(statuses: $statuses, page: $page) {
      items {
        ...ParcelFields
      }
      total
      page
      limit
      totalPages
    }
  }
`);

export const parcelDocument = graphql(`
  query Parcel($id: ID!) {
    parcel(id: $id) {
      ...ParcelFields
      signature {
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
