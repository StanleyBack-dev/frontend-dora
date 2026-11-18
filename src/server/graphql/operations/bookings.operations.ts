import { graphql } from "@/server/graphql/generated";

export const bookingFieldsFragment = graphql(`
  fragment BookingFields on Booking {
    id
    spaceId
    spaceName
    spaceKind
    guestsAllowed
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
    feeCents
    feeBilledAt
    seriesId
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
        waitlisted
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

export const condominiumSpaceBlocksDocument = graphql(`
  query CondominiumSpaceBlocks {
    condominiumSpaceBlocks {
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

// --- weekly series ---

export const createBookingSeriesDocument = graphql(`
  mutation CreateBookingSeries($input: CreateBookingSeriesInput!) {
    createBookingSeries(input: $input) {
      seriesId
      created {
        ...BookingFields
      }
      skipped {
        startsAt
        reason
      }
    }
  }
`);

export const cancelBookingSeriesDocument = graphql(`
  mutation CancelBookingSeries($seriesId: ID!) {
    cancelBookingSeries(seriesId: $seriesId) {
      cancelled
      kept
    }
  }
`);

// --- waiting list ---

export const joinWaitlistDocument = graphql(`
  mutation JoinWaitlist($input: WaitlistSlotInput!) {
    joinWaitlist(input: $input)
  }
`);

export const leaveWaitlistDocument = graphql(`
  mutation LeaveWaitlist($input: WaitlistSlotInput!) {
    leaveWaitlist(input: $input)
  }
`);

// --- guests ---

export const bookingGuestFieldsFragment = graphql(`
  fragment BookingGuestFields on BookingGuest {
    id
    bookingId
    name
    documentType
    document
    phone
    code
    checkedInAt
    createdAt
  }
`);

export const bookingGuestsDocument = graphql(`
  query BookingGuests($bookingId: ID!) {
    bookingGuests(bookingId: $bookingId) {
      ...BookingGuestFields
    }
  }
`);

export const addBookingGuestsDocument = graphql(`
  mutation AddBookingGuests($input: AddBookingGuestsInput!) {
    addBookingGuests(input: $input) {
      ...BookingGuestFields
    }
  }
`);

export const removeBookingGuestDocument = graphql(`
  mutation RemoveBookingGuest($id: ID!) {
    removeBookingGuest(id: $id)
  }
`);

export const guestInviteDocument = graphql(`
  query GuestInvite($code: String!) {
    guestInvite(code: $code) {
      code
      guestName
      hostFirstName
      spaceName
      condominiumName
      startsAt
      endsAt
      status
      checkedIn
    }
  }
`);

// --- the gate (Portaria) ---

export const gateGuestFieldsFragment = graphql(`
  fragment GateGuestFields on GateGuest {
    id
    bookingId
    name
    documentType
    document
    phone
    code
    checkedInAt
    spaceName
    startsAt
    endsAt
    hostName
    unitLabel
    checkInWindow
  }
`);

export const gateGuestsDocument = graphql(`
  query GateGuests($date: String) {
    gateGuests(date: $date) {
      ...GateGuestFields
    }
  }
`);

export const dayGuestsDocument = graphql(`
  query DayGuests(
    $date: String
    $filter: DayGuestFilterInput
    $page: PageInput
  ) {
    dayGuests(date: $date, filter: $filter, page: $page) {
      items {
        ...GateGuestFields
      }
      total
      page
      limit
      totalPages
    }
  }
`);

export const dayGuestsOverviewDocument = graphql(`
  query DayGuestsOverview($date: String) {
    dayGuestsOverview(date: $date) {
      total
      checkedIn
      bookings
      guests {
        id
        label
      }
      hosts {
        id
        label
      }
      units {
        id
        label
      }
      spaces {
        id
        label
      }
    }
  }
`);

export const checkInGuestDocument = graphql(`
  mutation CheckInGuest($input: CheckInGuestInput!) {
    checkInGuest(input: $input) {
      ...GateGuestFields
    }
  }
`);

export const undoGuestCheckInDocument = graphql(`
  mutation UndoGuestCheckIn($guestId: ID!) {
    undoGuestCheckIn(guestId: $guestId) {
      ...GateGuestFields
    }
  }
`);

// --- usage fees ---

export const bookingFeesDocument = graphql(`
  query BookingFees($month: String, $filter: FeeFilterInput) {
    bookingFees(month: $month, filter: $filter) {
      month
      totalCents
      billedCents
      items {
        ...BookingFields
      }
    }
  }
`);

export const bookingFeesPageDocument = graphql(`
  query BookingFeesPage(
    $month: String
    $filter: FeeFilterInput
    $page: PageInput
  ) {
    bookingFeesPage(month: $month, filter: $filter, page: $page) {
      items {
        ...BookingFields
      }
      total
      page
      limit
      totalPages
    }
  }
`);

export const bookingFeesOverviewDocument = graphql(`
  query BookingFeesOverview($month: String) {
    bookingFeesOverview(month: $month) {
      month
      count
      totalCents
      billedCents
      units {
        id
        label
      }
      spaces {
        id
        label
      }
      users {
        id
        label
      }
    }
  }
`);

export const setBookingFeesBilledDocument = graphql(`
  mutation SetBookingFeesBilled($input: SetBookingFeesBilledInput!) {
    setBookingFeesBilled(input: $input)
  }
`);
