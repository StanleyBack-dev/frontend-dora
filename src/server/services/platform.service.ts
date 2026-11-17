import "server-only";
import { backendGraphql } from "@/server/graphql/client";
import {
  condominiumMembersDocument,
  platformPeopleDocument,
} from "@/server/graphql/operations/platform.operations";
import type { Paginated } from "@/shared/contracts/api";
import type {
  CondominiumMember,
  PlatformPeopleFilter,
  PlatformPerson,
} from "@/shared/contracts/platform";

// The platform directory: everyone with an account, and each
// condominium's people (only the platform administrator).
export const platformService = {
  async people(
    token: string,
    filter: PlatformPeopleFilter,
    page: { page: number; limit: number },
  ): Promise<Paginated<PlatformPerson>> {
    const { platformPeople } = await backendGraphql(platformPeopleDocument, {
      token,
      variables: {
        filter: {
          search: filter.search || undefined,
          role: filter.role,
          condominiumId: filter.condominiumId,
        },
        page,
      },
    });
    return platformPeople;
  },

  async members(
    token: string,
    condominiumId: string,
  ): Promise<CondominiumMember[]> {
    const { condominiumMembers } = await backendGraphql(
      condominiumMembersDocument,
      { token, variables: { condominiumId } },
    );
    return condominiumMembers;
  },
};
