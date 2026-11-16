import "server-only";
import { backendGraphql } from "@/server/graphql/client";
import {
  condominiumPixDocument,
  removeCondominiumPixDocument,
  setCondominiumPixDocument,
} from "@/server/graphql/operations/payments.operations";
import type { PixReceiver } from "@/shared/contracts/events";

// The condominium's PIX (whoever manages payments).
export const paymentsService = {
  async condominiumPix(token: string): Promise<PixReceiver | null> {
    const { condominiumPix } = await backendGraphql(condominiumPixDocument, {
      token,
    });
    return condominiumPix ?? null;
  },

  async setCondominiumPix(
    token: string,
    input: PixReceiver,
  ): Promise<PixReceiver> {
    const { setCondominiumPix } = await backendGraphql(
      setCondominiumPixDocument,
      { token, variables: { input } },
    );
    return setCondominiumPix;
  },

  async removeCondominiumPix(token: string): Promise<void> {
    await backendGraphql(removeCondominiumPixDocument, { token });
  },
};
