import "server-only";
import { authed } from "@/server/auth/current-user";
import { BackendError } from "@/server/http/backend-error";
import { purchaseOrdersService } from "@/server/services/purchase-orders.service";
import type { PurchaseOrderView } from "@/shared/contracts/purchase-orders";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * A purchase's order page the caller may see, or null (the page shows
 * 404): not approved yet, or (for the gate) no order placed yet.
 */
export async function loadPurchaseOrder(
  requestId: string,
): Promise<PurchaseOrderView | null> {
  if (!UUID.test(requestId)) return null;
  return authed(async (token) => {
    try {
      return await purchaseOrdersService.view(token, requestId);
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
