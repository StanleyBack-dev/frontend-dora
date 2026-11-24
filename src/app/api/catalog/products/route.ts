import { NextResponse } from "next/server";
import { bffRoute, readBody, requireToken } from "@/server/http/route-handler";
import { productInputSchema } from "@/server/http/schemas/catalog.schema";
import { catalogService } from "@/server/services/catalog.service";

/** Registers a product in the catalog (also while filling in an item). */
export const POST = bffRoute(async (request) => {
  const input = await readBody(request, productInputSchema);
  return NextResponse.json(
    await catalogService.createProduct(await requireToken(), input),
  );
});
