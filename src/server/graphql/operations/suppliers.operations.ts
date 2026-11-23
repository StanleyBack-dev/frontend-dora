import { graphql } from "@/server/graphql/generated";

export const supplierFieldsFragment = graphql(`
  fragment SupplierFields on Supplier {
    id
    documentType
    document
    name
    tradeName
    categories
    categoryOther
    contactName
    email
    phone
    city
    state
    pixKeyType
    pixKey
    notes
    active
    ratingAverage
    ratingCount
    createdAt
    updatedAt
  }
`);

export const suppliersDocument = graphql(`
  query Suppliers($filter: SupplierFilterInput, $page: PageInput) {
    suppliers(filter: $filter, page: $page) {
      items {
        ...SupplierFields
      }
      total
      page
      limit
      totalPages
    }
  }
`);

export const createSupplierDocument = graphql(`
  mutation CreateSupplier($input: SupplierInput!) {
    createSupplier(input: $input) {
      ...SupplierFields
    }
  }
`);

export const updateSupplierDocument = graphql(`
  mutation UpdateSupplier($id: ID!, $input: SupplierInput!) {
    updateSupplier(id: $id, input: $input) {
      ...SupplierFields
    }
  }
`);

export const setSupplierActiveDocument = graphql(`
  mutation SetSupplierActive($id: ID!, $active: Boolean!) {
    setSupplierActive(id: $id, active: $active) {
      ...SupplierFields
    }
  }
`);

export const supplierFilterOptionsDocument = graphql(`
  query SupplierFilterOptions {
    supplierFilterOptions {
      suppliers {
        id
        name
      }
      contacts
      documents {
        documentType
        document
      }
    }
  }
`);

export const supplierOverviewDocument = graphql(`
  query SupplierOverview {
    supplierOverview {
      active
      inactive
      activeWithoutPix
      activeWithoutContact
      categoriesServed
    }
  }
`);

export const supplierOptionsDocument = graphql(`
  query SupplierOptions {
    supplierOptions {
      id
      name
      categories
      categoryOther
      ratingAverage
      ratingCount
    }
  }
`);
