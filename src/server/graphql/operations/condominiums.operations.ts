import { graphql } from "@/server/graphql/generated";

// === platform console ===

export const condominiumFieldsFragment = graphql(`
  fragment CondominiumFields on Condominium {
    id
    name
    document
    city
    state
    status
    activeMembers
    managers
    units
    pendingEnrollments
    lastActivityAt
    createdAt
  }
`);

export const condominiumsDocument = graphql(`
  query Condominiums($filter: CondominiumFilterInput) {
    condominiums(filter: $filter) {
      ...CondominiumFields
    }
  }
`);

export const createCondominiumDocument = graphql(`
  mutation CreateCondominium($input: CondominiumInput!) {
    createCondominium(input: $input) {
      ...CondominiumFields
    }
  }
`);

export const updateCondominiumDocument = graphql(`
  mutation UpdateCondominium($id: ID!, $input: CondominiumInput!) {
    updateCondominium(id: $id, input: $input) {
      ...CondominiumFields
    }
  }
`);

export const setCondominiumStatusDocument = graphql(`
  mutation SetCondominiumStatus($id: ID!, $status: CondominiumStatus!) {
    setCondominiumStatus(id: $id, status: $status) {
      ...CondominiumFields
    }
  }
`);

// === the session's condominium: units ===

export const unitFieldsFragment = graphql(`
  fragment UnitFields on Unit {
    id
    block
    number
    label
    residents
  }
`);

export const unitsDocument = graphql(`
  query Units {
    units {
      ...UnitFields
    }
  }
`);

export const createUnitsDocument = graphql(`
  mutation CreateUnits($input: CreateUnitsInput!) {
    createUnits(input: $input) {
      ...UnitFields
    }
  }
`);

export const updateUnitDocument = graphql(`
  mutation UpdateUnit($id: ID!, $input: UpdateUnitInput!) {
    updateUnit(id: $id, input: $input) {
      ...UnitFields
    }
  }
`);

export const deleteUnitDocument = graphql(`
  mutation DeleteUnit($id: ID!) {
    deleteUnit(id: $id)
  }
`);
