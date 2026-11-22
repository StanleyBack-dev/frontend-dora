import { NextResponse } from "next/server";
import { bffRoute, readBody, requireToken } from "@/server/http/route-handler";
import { brandNameSchema } from "@/server/http/schemas/catalog.schema";
import { catalogService } from "@/server/services/catalog.service";

/** Registers a brand in the catalog (also while filling in an item). */
export const POST = bffRoute(async (request) => {
  const { name } = await readBody(request, brandNameSchema);
  return NextResponse.json(
    await catalogService.createBrand(await requireToken(), name),
  );
});
