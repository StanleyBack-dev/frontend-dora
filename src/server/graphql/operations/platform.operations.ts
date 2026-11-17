import { graphql } from "@/server/graphql/generated";

// === the platform directory (Plataforma) ===

export const platformPeopleDocument = graphql(`
  query PlatformPeople($filter: PlatformPeopleFilterInput, $page: PageInput) {
    platformPeople(filter: $filter, page: $page) {
      total
      page
      limit
      totalPages
      items {
        id
        name
        email
        username
        phone
        platformAdmin
        active
        lockedUntil
        lastLoginAt
        createdAt
        memberships {
          condominiumId
          condominiumName
          role
          kind
          active
        }
      }
    }
  }
`);

export const condominiumMembersDocument = graphql(`
  query CondominiumMembers($condominiumId: ID!) {
    condominiumMembers(condominiumId: $condominiumId) {
      userId
      name
      email
      username
      phone
      role
      kind
      active
      unitLabel
      jobTitle
      lastLoginAt
      since
    }
  }
`);
