import "server-only";
import { authed } from "@/server/auth/current-user";
import { BackendError } from "@/server/http/backend-error";
import { spacesService } from "@/server/services/spaces.service";
import type { Space } from "@/shared/contracts/spaces";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** The space of the current condominium, or null (the page shows 404). */
export async function loadSpace(id: string): Promise<Space | null> {
  if (!UUID.test(id)) return null;
  return authed(async (token) => {
    try {
      return await spacesService.get(token, id);
    } catch (error) {
      if (error instanceof BackendError && error.code === "SPACE_NOT_FOUND") {
        return null;
      }
      throw error;
    }
  });
}
