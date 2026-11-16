import "server-only";
import { authed } from "@/server/auth/current-user";
import { paymentsService } from "@/server/services/payments.service";
import type { SessionUser } from "@/shared/contracts/api";
import type { PixReceiver } from "@/shared/contracts/events";
import { can } from "@/shared/lib/access";

/**
 * The condominium's PIX for whoever manages payments: null when it isn't
 * set, undefined when the person can't see it.
 */
export async function loadCondominiumPix(
  user: SessionUser,
): Promise<PixReceiver | null | undefined> {
  if (!can(user, "PAYMENTS_MANAGE")) return undefined;
  return authed((token) => paymentsService.condominiumPix(token));
}
