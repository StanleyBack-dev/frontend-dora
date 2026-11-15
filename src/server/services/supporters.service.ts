import "server-only";
import { backendGraphql } from "@/server/graphql/client";
import {
  deleteSupportContributionDocument,
  deleteSupporterDocument,
  recordSupportContributionDocument,
  supportersDocument,
  supportRankingDocument,
  updateSupporterDocument,
} from "@/server/graphql/operations/supporters.operations";
import type {
  SupportContributionInput,
  Supporter,
  SupporterInput,
  SupportRanking,
} from "@/shared/contracts/supporters";

export const supportersService = {
  /** Everyone signed in: all time (null) or one year. */
  async ranking(token: string, year: number | null): Promise<SupportRanking> {
    const { supportRanking } = await backendGraphql(supportRankingDocument, {
      token,
      variables: { year },
    });
    return supportRanking;
  },

  /** Platform administrator: every supporter with each contribution. */
  async list(token: string): Promise<Supporter[]> {
    const { supporters } = await backendGraphql(supportersDocument, { token });
    return supporters;
  },

  async record(token: string, input: SupportContributionInput): Promise<void> {
    await backendGraphql(recordSupportContributionDocument, {
      token,
      variables: { input },
    });
  },

  async update(
    token: string,
    id: string,
    input: SupporterInput,
  ): Promise<void> {
    await backendGraphql(updateSupporterDocument, {
      token,
      variables: { id, input },
    });
  },

  async remove(token: string, id: string): Promise<void> {
    await backendGraphql(deleteSupporterDocument, {
      token,
      variables: { id },
    });
  },

  async removeContribution(token: string, id: string): Promise<void> {
    await backendGraphql(deleteSupportContributionDocument, {
      token,
      variables: { id },
    });
  },
};
