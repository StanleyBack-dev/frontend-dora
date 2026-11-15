import "server-only";
import { backendGraphql } from "@/server/graphql/client";
import { appInfoDocument } from "@/server/graphql/operations/app-info.operations";
import type { BuildInfo } from "@/shared/lib/app-version";

export const appInfoService = {
  /** The API's version and deploy date (public; null when unreachable). */
  async api(): Promise<BuildInfo | null> {
    try {
      const { appInfo } = await backendGraphql(appInfoDocument, {});
      return {
        version: appInfo.version,
        commit: appInfo.commit ?? null,
        updatedAt: appInfo.deployedAt ?? null,
      };
    } catch {
      return null;
    }
  },
};
