import "server-only";
import { authed } from "@/server/auth/current-user";
import { BackendError } from "@/server/http/backend-error";
import { parcelsService } from "@/server/services/parcels.service";
import type { ParcelWithReceipt } from "@/shared/contracts/parcels";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * A parcel the caller may see, with its receipt, or null (the page shows
 * 404): the API hides another unit's parcels, and those registered for
 * another resident by name.
 */
export async function loadParcel(
  id: string,
): Promise<ParcelWithReceipt | null> {
  if (!UUID.test(id)) return null;
  return authed(async (token) => {
    try {
      return await parcelsService.get(token, id);
    } catch (error) {
      if (error instanceof BackendError && error.code === "PARCEL_NOT_FOUND") {
        return null;
      }
      throw error;
    }
  });
}
