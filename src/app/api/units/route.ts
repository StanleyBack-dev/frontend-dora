import { NextResponse } from "next/server";
import { bffRoute, readBody, requireToken } from "@/server/http/route-handler";
import { createUnitsSchema } from "@/server/http/schemas/condominiums.schema";
import { condominiumsService } from "@/server/services/condominiums.service";

export const POST = bffRoute(async (request) => {
  const input = await readBody(request, createUnitsSchema);
  return NextResponse.json(
    await condominiumsService.createUnits(await requireToken(), input),
  );
});
