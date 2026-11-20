import { graphql } from "@/server/graphql/generated";

export const residentsDirectoryDocument = graphql(`
  query ResidentsDirectory($filter: ResidentsFilterInput, $page: PageInput) {
    residentsDirectory(filter: $filter, page: $page) {
      items {
        userId
        name
        photoUrl
        unitId
        unitLabel
        unitComplement
        phone
        dependents {
          id
          name
          relationship
        }
      }
      total
      page
      limit
      totalPages
    }
  }
`);

export const residentNamesDocument = graphql(`
  query ResidentNames {
    residentNames {
      id
      name
    }
  }
`);
