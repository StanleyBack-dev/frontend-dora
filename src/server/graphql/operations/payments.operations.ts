import { graphql } from "@/server/graphql/generated";

export const condominiumPixDocument = graphql(`
  query CondominiumPix {
    condominiumPix {
      keyType
      key
      name
      city
    }
  }
`);

export const setCondominiumPixDocument = graphql(`
  mutation SetCondominiumPix($input: PixReceiverInput!) {
    setCondominiumPix(input: $input) {
      keyType
      key
      name
      city
    }
  }
`);

export const removeCondominiumPixDocument = graphql(`
  mutation RemoveCondominiumPix {
    removeCondominiumPix
  }
`);
