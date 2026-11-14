import { graphql } from "@/server/graphql/generated";

export const spaceFieldsFragment = graphql(`
  fragment SpaceFields on Space {
    id
    name
    kind
    description
    capacity
    usageRules
    active
    createdAt
    updatedAt
    rules {
      openingHours {
        weekday
        opensAt
        closesAt
      }
      slotMinutes
      minAdvanceHours
      maxAdvanceDays
      unitLimit {
        count
        period
      }
      requiresApproval
      cancelUntilHours
    }
  }
`);

export const spacesDocument = graphql(`
  query Spaces($includeInactive: Boolean!) {
    spaces(includeInactive: $includeInactive) {
      ...SpaceFields
    }
  }
`);

export const spaceDocument = graphql(`
  query Space($id: ID!) {
    space(id: $id) {
      ...SpaceFields
    }
  }
`);

export const createSpaceDocument = graphql(`
  mutation CreateSpace($input: SpaceInput!) {
    createSpace(input: $input) {
      ...SpaceFields
    }
  }
`);

export const updateSpaceDocument = graphql(`
  mutation UpdateSpace($id: ID!, $input: SpaceInput!) {
    updateSpace(id: $id, input: $input) {
      ...SpaceFields
    }
  }
`);

export const setSpaceActiveDocument = graphql(`
  mutation SetSpaceActive($id: ID!, $active: Boolean!) {
    setSpaceActive(id: $id, active: $active) {
      ...SpaceFields
    }
  }
`);

export const deleteSpaceDocument = graphql(`
  mutation DeleteSpace($id: ID!) {
    deleteSpace(id: $id)
  }
`);
