import "server-only";
import { backendGraphql } from "@/server/graphql/client";
import { dashboardDocument } from "@/server/graphql/operations/dashboard.operations";
import type { Dashboard } from "@/shared/contracts/dashboard";

export const dashboardService = {
  async get(token: string): Promise<Dashboard> {
    const { dashboard } = await backendGraphql(dashboardDocument, { token });
    return dashboard;
  },
};
