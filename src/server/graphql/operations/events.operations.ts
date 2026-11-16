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
