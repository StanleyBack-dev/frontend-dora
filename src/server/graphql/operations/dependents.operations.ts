import { graphql } from "@/server/graphql/generated";

export const dependentFieldsFragment = graphql(`
  fragment DependentFields on Dependent {
    id
    name
    birthDate
    relationship
    status
    holderName
    unitLabel
    rejectReason
    reviewedAt
    createdAt
    documentUrl
    documentContentType
  }
`);

export const myDependentsDocument = graphql(`
  query MyDependents {
    myDependents {
      ...DependentFields
    }
  }
`);

export const addDependentDocument = graphql(`
  mutation AddDependent($input: DependentInput!) {
    addDependent(input: $input) {
      ...DependentFields
    }
  }
`);

export const removeDependentDocument = graphql(`
  mutation RemoveDependent($id: ID!) {
    removeDependent(id: $id)
  }
`);

export const approveDependentDocument = graphql(`
  mutation ApproveDependent($id: ID!) {
    approveDependent(id: $id) {
      ...DependentFields
    }
  }
`);

export const rejectDependentDocument = graphql(`
  mutation RejectDependent($id: ID!, $reason: String!) {
    rejectDependent(id: $id, reason: $reason) {
      ...DependentFields
    }
  }
`);

// Gestão > Dependentes: a page of the filtered dependents.
export const dependentsPageDocument = graphql(`
  query DependentsPage($filter: DependentReviewFilterInput, $page: PageInput) {
    dependentsPage(filter: $filter, page: $page) {
      total
      page
      limit
      totalPages
      items {
        ...DependentFields
      }
    }
  }
`);

// The counts by status and what the filters offer, whatever the filters.
export const dependentsReviewOverviewDocument = graphql(`
  query DependentsReviewOverview {
    dependentsReviewOverview {
      pending
      approved
      rejected
      dependents {
        id
        label
      }
      holders {
        id
        label
      }
      units {
        id
        label
      }
    }
  }
`);
