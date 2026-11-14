import "server-only";
import { backendGraphql } from "@/server/graphql/client";
import { platformMetricsDocument } from "@/server/graphql/operations/platform-metrics.operations";
import type {
  PlatformMetrics,
  PlatformMetricsFilter,
} from "@/shared/contracts/platform-metrics";

export const platformMetricsService = {
  /** The platform panel; the API checks the period and the permission. */
  async get(
    token: string,
    filter: PlatformMetricsFilter,
  ): Promise<PlatformMetrics> {
    const { platformMetrics } = await backendGraphql(platformMetricsDocument, {
      token,
      variables: { filter },
    });
    return platformMetrics;
  },
};
