import "server-only";
import { backendGraphql } from "@/server/graphql/client";
import {
  residentNamesDocument,
  residentsDirectoryDocument,
} from "@/server/graphql/operations/residents.operations";
import type { Paginated } from "@/shared/contracts/api";
import type {
  ResidentListing,
  ResidentsFilter,
} from "@/shared/contracts/residents";

// The residents' directory (RESIDENTS_READ): read only, filtered and paged
// by the API.
export const residentsService = {
  async list(
    token: string,
    filter: ResidentsFilter,
    page: { page: number; limit: number },
  ): Promise<Paginated<ResidentListing>> {
    const { residentsDirectory } = await backendGraphql(
      residentsDirectoryDocument,
      { token, variables: { filter, page } },
    );
    return residentsDirectory;
  },

  /** The residents' names, for the name filter. */
  async names(token: string): Promise<{ id: string; name: string }[]> {
    const { residentNames } = await backendGraphql(residentNamesDocument, {
      token,
    });
    return residentNames;
  },
};
