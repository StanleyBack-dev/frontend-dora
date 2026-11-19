import "server-only";
import { backendGraphql } from "@/server/graphql/client";
import {
  broadcastStatsDocument,
  broadcastsDocument,
  sendBroadcastDocument,
} from "@/server/graphql/operations/broadcasts.operations";
import type {
  Broadcast,
  BroadcastInput,
  BroadcastStats,
} from "@/shared/contracts/broadcasts";

export const broadcastsService = {
  async list(token: string): Promise<Broadcast[]> {
    const { broadcasts } = await backendGraphql(broadcastsDocument, { token });
    return broadcasts;
  },

  async stats(token: string): Promise<BroadcastStats> {
    const { broadcastStats } = await backendGraphql(broadcastStatsDocument, {
      token,
    });
    return broadcastStats;
  },

  async send(token: string, input: BroadcastInput): Promise<Broadcast> {
    const { sendBroadcast } = await backendGraphql(sendBroadcastDocument, {
      token,
      variables: { input },
    });
    return sendBroadcast;
  },
};
