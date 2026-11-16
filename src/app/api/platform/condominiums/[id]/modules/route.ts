import { NextResponse } from "next/server";
import { bffRoute, readBody, requireToken } from "@/server/http/route-handler";
import {
  condominiumIdSchema,
  condominiumModuleSchema,
} from "@/server/http/schemas/condominiums.schema";
import { condominiumsService } from "@/server/services/condominiums.service";

// Turns an optional module on or off (the API checks CONDOMINIUMS_MANAGE).
export const POST = bffRoute<{ id: string }>(async (request, { params }) => {
  const id = condominiumIdSchema.parse((await params).id);
  const { module, enabled } = await readBody(request, condominiumModuleSchema);
  return NextResponse.json(
    await condominiumsService.setModule(
      await requireToken(),
      id,
      module,
      enabled,
    ),
  );
});
