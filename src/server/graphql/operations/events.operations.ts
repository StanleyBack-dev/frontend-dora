import { graphql } from "@/server/graphql/generated";

export const eventFieldsFragment = graphql(`
  fragment EventFields on Event {
    id
    title
    description
    spaceId
    spaceName
    location
    address {
      zip
      street
      number
      complement
      district
      city
      state
    }
    startsAt
    endsAt
    capacity
    externalGuestLimit
    ticketed
    fullPriceCents
    ticketTypes {
      id
      kind
      name
      priceMode
      customPriceCents
      priceCents
      minAge
      maxAge
    }
    unitTicketLimit
    salesClose
    salesCloseHours
    salesClosesAt
    pixSource
    customPix {
      keyType
      key
      name
      city
    }
    placesLeft
    outsidePlacesLeft
    status
    cancelReason
    publishedAt
    cancelledAt
    createdAt
  }
`);

export const eventsDocument = graphql(`
  query Events($when: EventWhen) {
    events(when: $when) {
      ...EventFields
    }
  }
`);

export const eventDocument = graphql(`
  query Event($id: ID!) {
    event(id: $id) {
      ...EventFields
    }
  }
`);

export const createEventDocument = graphql(`
  mutation CreateEvent($input: EventInput!) {
    createEvent(input: $input) {
      ...EventFields
    }
  }
`);

export const updateEventDocument = graphql(`
  mutation UpdateEvent($id: ID!, $input: EventInput!) {
    updateEvent(id: $id, input: $input) {
      ...EventFields
    }
  }
`);

export const publishEventDocument = graphql(`
  mutation PublishEvent($id: ID!) {
    publishEvent(id: $id) {
      ...EventFields
    }
  }
`);

export const cancelEventDocument = graphql(`
  mutation CancelEvent($id: ID!, $reason: String!) {
    cancelEvent(id: $id, reason: $reason) {
      ...EventFields
    }
  }
`);

export const eventOrderFieldsFragment = graphql(`
  fragment EventOrderFields on EventOrder {
    id
    eventId
    eventTitle
    code
    status
    totalCents
    buyerName
    unitLabel
    attendees {
      id
      source
      dependentId
      name
      age
      outside
      ticketName
      priceCents
      needsProof
      proofUrl
      proofContentType
      ticketCode
      checkedInAt
    }
    pix {
      keyType
      key
      name
      city
    }
    pixCode
    expiresAt
    receiptSentAt
    receiptContentType
    receiptUrl
    reviewedAt
    rejectReason
    cancelledAt
    createdAt
  }
`);

export const myEventOrdersDocument = graphql(`
  query MyEventOrders($eventId: ID!) {
    myEventOrders(eventId: $eventId) {
      ...EventOrderFields
    }
  }
`);

export const eventOrdersDocument = graphql(`
  query EventOrders($eventId: ID!, $status: EventOrderStatus) {
    eventOrders(eventId: $eventId, status: $status) {
      ...EventOrderFields
    }
  }
`);

export const createEventOrderDocument = graphql(`
  mutation CreateEventOrder($eventId: ID!, $attendees: [AttendeeInput!]!) {
    createEventOrder(eventId: $eventId, attendees: $attendees) {
      ...EventOrderFields
    }
  }
`);

export const submitEventOrderReceiptDocument = graphql(`
  mutation SubmitEventOrderReceipt($id: ID!, $file: String!) {
    submitEventOrderReceipt(id: $id, file: $file) {
      ...EventOrderFields
    }
  }
`);

export const cancelEventOrderDocument = graphql(`
  mutation CancelEventOrder($id: ID!) {
    cancelEventOrder(id: $id) {
      ...EventOrderFields
    }
  }
`);

export const approveEventOrderDocument = graphql(`
  mutation ApproveEventOrder($id: ID!) {
    approveEventOrder(id: $id) {
      ...EventOrderFields
    }
  }
`);

export const rejectEventOrderDocument = graphql(`
  mutation RejectEventOrder($id: ID!, $reason: String!) {
    rejectEventOrder(id: $id, reason: $reason) {
      ...EventOrderFields
    }
  }
`);

export const submitEventAttendeeProofDocument = graphql(`
  mutation SubmitEventAttendeeProof(
    $orderId: ID!
    $attendeeId: ID!
    $file: String!
  ) {
    submitEventAttendeeProof(
      orderId: $orderId
      attendeeId: $attendeeId
      file: $file
    ) {
      ...EventOrderFields
    }
  }
`);

// --- the gate (Portaria) and the ticket page ---

export const gateEventTicketFieldsFragment = graphql(`
  fragment GateEventTicketFields on GateEventTicket {
    id
    name
    age
    outside
    source
    ticketName
    ticketCode
    checkedInAt
    entryWindow
    eventId
    eventTitle
    eventStatus
    startsAt
    endsAt
    placeName
    orderCode
    buyerName
    unitLabel
  }
`);

export const gateEventTicketsDocument = graphql(`
  query GateEventTickets($date: String) {
    gateEventTickets(date: $date) {
      ...GateEventTicketFields
    }
  }
`);

export const checkInEventTicketDocument = graphql(`
  mutation CheckInEventTicket($input: CheckInEventTicketInput!) {
    checkInEventTicket(input: $input) {
      ...GateEventTicketFields
    }
  }
`);

export const undoEventTicketCheckInDocument = graphql(`
  mutation UndoEventTicketCheckIn($attendeeId: ID!) {
    undoEventTicketCheckIn(attendeeId: $attendeeId) {
      ...GateEventTicketFields
    }
  }
`);

export const eventTicketPassDocument = graphql(`
  query EventTicketPass($code: String!) {
    eventTicket(code: $code) {
      code
      name
      ticketName
      eventTitle
      placeName
      condominiumName
      startsAt
      endsAt
      buyerFirstName
      status
      checkedIn
    }
  }
`);

// --- the events module in the management ---

export const eventOrdersQueueDocument = graphql(`
  query EventOrdersQueue($status: EventOrderStatus, $eventId: ID) {
    eventOrdersQueue(status: $status, eventId: $eventId) {
      ...EventOrderFields
    }
  }
`);

export const eventTicketsDocument = graphql(`
  query EventTickets($eventId: ID!) {
    eventTickets(eventId: $eventId) {
      ...GateEventTicketFields
    }
  }
`);
