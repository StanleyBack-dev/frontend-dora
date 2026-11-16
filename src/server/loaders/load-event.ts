import "server-only";
import { authed } from "@/server/auth/current-user";
import { BackendError } from "@/server/http/backend-error";
import { eventsService } from "@/server/services/events.service";
import type { CondominiumEvent } from "@/shared/contracts/events";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** The event of the current condominium, or null (the page shows 404). */
export async function loadEvent(id: string): Promise<CondominiumEvent | null> {
  if (!UUID.test(id)) return null;
  return authed(async (token) => {
    try {
      return await eventsService.get(token, id);
    } catch (error) {
      if (error instanceof BackendError && error.code === "EVENT_NOT_FOUND") {
        return null;
      }
      throw error;
    }
  });
}
