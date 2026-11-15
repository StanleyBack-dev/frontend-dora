import "server-only";
import { serverEnv } from "@/server/config/env";
import type { PixReceiver } from "@/shared/lib/pix";

/**
 * Who receives contributions to the project (PIX), or null when it is off
 * (any of key, name or city left empty).
 */
export function pixReceiver(): PixReceiver | null {
  const env = serverEnv();
  if (!env.PIX_KEY || !env.PIX_RECEIVER_NAME || !env.PIX_RECEIVER_CITY) {
    return null;
  }
  return {
    key: env.PIX_KEY,
    name: env.PIX_RECEIVER_NAME,
    city: env.PIX_RECEIVER_CITY,
    description: "Apoio ao Dora",
  };
}
