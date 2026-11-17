import "server-only";
import { authed } from "@/server/auth/current-user";
import { BackendError } from "@/server/http/backend-error";
import { condominiumsService } from "@/server/services/condominiums.service";
import type { Condominium } from "@/shared/contracts/condominiums";

/** The ids the API accepts (v4, as the database draws them). */
const UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/** Any condominium (the platform), or null (the page shows 404). */
export async function loadCondominium(id: string): Promise<Condominium | null> {
  if (!UUID.test(id)) return null;
  return authed(async (token) => {
    try {
      return await condominiumsService.get(token, id);
    } catch (error) {
      if (
        error instanceof BackendError &&
        error.code === "CONDOMINIUM_NOT_FOUND"
      ) {
        return null;
      }
      throw error;
    }
  });
}
