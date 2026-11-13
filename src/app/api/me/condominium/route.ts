import { NextResponse } from "next/server";
import { bffRoute, readBody, requireToken } from "@/server/http/route-handler";
import { switchCondominiumSchema } from "@/server/http/schemas/condominiums.schema";
import { condominiumsService } from "@/server/services/condominiums.service";

// Switches the condominium the session works in (null: platform view).
export const PUT = bffRoute(async (request) => {
  const { condominiumId } = await readBody(request, switchCondominiumSchema);
  await condominiumsService.switchTo(await requireToken(), condominiumId);
  return NextResponse.json({ ok: true });
});
