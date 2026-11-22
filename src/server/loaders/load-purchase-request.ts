import "server-only";
import { authed } from "@/server/auth/current-user";
import { BackendError } from "@/server/http/backend-error";
import { purchaseRequestsService } from "@/server/services/purchase-requests.service";
import type { PurchaseRequest } from "@/shared/contracts/purchase-requests";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * A purchase request the caller may see, or null (the page shows 404): the
 * API hides other people's requests from who only asks for purchases.
 */
export async function loadPurchaseRequest(
  id: string,
): Promise<PurchaseRequest | null> {
  if (!UUID.test(id)) return null;
  return authed(async (token) => {
    try {
      return await purchaseRequestsService.get(token, id);
    } catch (error) {
      if (
        error instanceof BackendError &&
        error.code === "PURCHASE_REQUEST_NOT_FOUND"
      ) {
        return null;
      }
      throw error;
    }
  });
}
