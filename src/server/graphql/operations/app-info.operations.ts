import { graphql } from "@/server/graphql/generated";

export const appInfoDocument = graphql(`
  query AppInfo {
    appInfo {
      version
      commit
      deployedAt
    }
  }
`);
