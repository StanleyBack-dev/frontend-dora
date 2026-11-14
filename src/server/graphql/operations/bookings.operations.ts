import { graphql } from "@/server/graphql/generated";

export const bookingFieldsFragment = graphql(`
  fragment BookingFields on Booking {
    id
    spaceId
    spaceName
    spaceKind
    userId
    userName
    unitLabel
    startsAt
    endsAt
    status
    notes
    cancelUntil
    reason
    decidedAt
    cancelledAt
    cancelledByManager
    createdAt
  }
`);

export const myBookingsDocument = graphql(`
  query MyBookings($when: BookingWhen!, $page: PageInput) {
    myBookings(when: $when, page: $page) {
      total
      page
      limit
      totalPages
      items {
        ...BookingFields
      }
    }
  }
`);

export const bookingsDocument = graphql(`
  query Bookings($filter: BookingFilterInput, $page: PageInput) {
    bookings(filter: $filter, page: $page) {
      total
      page
      limit
      totalPages
      items {
        ...BookingFields
      }
    }
  }
`);

export const spaceAvailabilityDocument = graphql(`
  query SpaceAvailability($spaceId: ID!, $date: String!) {
    spaceAvailability(spaceId: $spaceId, date: $date) {
      spaceId
      date
      firstDate
      lastDate
      slots {
        startsAt
        endsAt
        state
        bookingId
        bookingStatus
        label
      }
    }
  }
`);

export const createBookingDocument = graphql(`
  mutation CreateBooking($input: CreateBookingInput!) {
    createBooking(input: $input) {
      ...BookingFields
    }
  }
`);

export const cancelBookingDocument = graphql(`
  mutation CancelBooking($id: ID!, $reason: String) {
    cancelBooking(id: $id, reason: $reason) {
      ...BookingFields
    }
  }
`);

export const approveBookingDocument = graphql(`
  mutation ApproveBooking($id: ID!) {
    approveBooking(id: $id) {
      ...BookingFields
    }
  }
`);

export const rejectBookingDocument = graphql(`
  mutation RejectBooking($id: ID!, $reason: String!) {
    rejectBooking(id: $id, reason: $reason) {
      ...BookingFields
    }
  }
`);

export const spaceBlocksDocument = graphql(`
  query SpaceBlocks($spaceId: ID!) {
    spaceBlocks(spaceId: $spaceId) {
      id
      spaceId
      startsAt
      endsAt
      reason
      createdByName
      createdAt
    }
  }
`);

export const createSpaceBlockDocument = graphql(`
  mutation CreateSpaceBlock($input: CreateSpaceBlockInput!) {
    createSpaceBlock(input: $input) {
      id
    }
  }
`);

export const deleteSpaceBlockDocument = graphql(`
  mutation DeleteSpaceBlock($id: ID!) {
    deleteSpaceBlock(id: $id)
  }
`);
