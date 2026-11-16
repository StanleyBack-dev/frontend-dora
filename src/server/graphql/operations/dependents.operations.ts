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

export const dependentsDocument = graphql(`
  query Dependents($status: DependentStatus) {
    dependents(status: $status) {
      ...DependentFields
    }
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
