import "server-only";
import { authed } from "@/server/auth/current-user";
import { BackendError } from "@/server/http/backend-error";
import { lostAndFoundService } from "@/server/services/lost-and-found.service";
import type { FoundItemDetails } from "@/shared/contracts/lost-and-found";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * A found item the caller may see, or null (the page shows 404): residents
 * only see kept items and those they claimed.
 */
export async function loadFoundItem(
  id: string,
): Promise<FoundItemDetails | null> {
  if (!UUID.test(id)) return null;
  return authed(async (token) => {
    try {
      return await lostAndFoundService.get(token, id);
    } catch (error) {
      if (
        error instanceof BackendError &&
        error.code === "FOUND_ITEM_NOT_FOUND"
      ) {
        return null;
      }
      throw error;
    }
  });
}
