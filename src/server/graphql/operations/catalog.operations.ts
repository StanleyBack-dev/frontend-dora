import { graphql } from "@/server/graphql/generated";

export const productFieldsFragment = graphql(`
  fragment ProductFields on Product {
    id
    name
    unit
    description
    active
    createdAt
    updatedAt
  }
`);

export const brandFieldsFragment = graphql(`
  fragment BrandFields on Brand {
    id
    name
    active
    createdAt
    updatedAt
  }
`);

export const productsDocument = graphql(`
  query Products($filter: CatalogFilterInput, $page: PageInput) {
    products(filter: $filter, page: $page) {
      items {
        ...ProductFields
      }
      total
      page
      limit
      totalPages
    }
  }
`);

export const productOptionsDocument = graphql(`
  query ProductOptions {
    productOptions {
      id
      name
      active
      unit
    }
  }
`);

export const productCountsDocument = graphql(`
  query ProductCounts {
    productCounts {
      active
      inactive
    }
  }
`);

export const createProductDocument = graphql(`
  mutation CreateProduct($input: ProductInput!) {
    createProduct(input: $input) {
      ...ProductFields
    }
  }
`);

export const updateProductDocument = graphql(`
  mutation UpdateProduct($id: ID!, $input: ProductInput!) {
    updateProduct(id: $id, input: $input) {
      ...ProductFields
    }
  }
`);

export const setProductActiveDocument = graphql(`
  mutation SetProductActive($id: ID!, $active: Boolean!) {
    setProductActive(id: $id, active: $active) {
      ...ProductFields
    }
  }
`);

export const brandsDocument = graphql(`
  query Brands($filter: CatalogFilterInput, $page: PageInput) {
    brands(filter: $filter, page: $page) {
      items {
        ...BrandFields
      }
      total
      page
      limit
      totalPages
    }
  }
`);

export const brandOptionsDocument = graphql(`
  query BrandOptions {
    brandOptions {
      id
      name
      active
    }
  }
`);

export const brandCountsDocument = graphql(`
  query BrandCounts {
    brandCounts {
      active
      inactive
    }
  }
`);

export const createBrandDocument = graphql(`
  mutation CreateBrand($name: String!) {
    createBrand(name: $name) {
      ...BrandFields
    }
  }
`);

export const renameBrandDocument = graphql(`
  mutation RenameBrand($id: ID!, $name: String!) {
    renameBrand(id: $id, name: $name) {
      ...BrandFields
    }
  }
`);

export const setBrandActiveDocument = graphql(`
  mutation SetBrandActive($id: ID!, $active: Boolean!) {
    setBrandActive(id: $id, active: $active) {
      ...BrandFields
    }
  }
`);
