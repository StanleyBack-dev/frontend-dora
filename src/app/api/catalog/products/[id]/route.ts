import { NextResponse } from "next/server";
import { bffRoute, readBody, requireToken } from "@/server/http/route-handler";
import {
  catalogActiveSchema,
  catalogIdSchema,
  productInputSchema,
} from "@/server/http/schemas/catalog.schema";
import { catalogService } from "@/server/services/catalog.service";

/** Saves the whole form. */
export const PUT = bffRoute<{ id: string }>(async (request, { params }) => {
  const id = catalogIdSchema.parse((await params).id);
  const input = await readBody(request, productInputSchema);
  return NextResponse.json(
    await catalogService.updateProduct(await requireToken(), id, input),
  );
});

/** Activates or deactivates (an inactive one stays in the history). */
export const PATCH = bffRoute<{ id: string }>(async (request, { params }) => {
  const id = catalogIdSchema.parse((await params).id);
  const { active } = await readBody(request, catalogActiveSchema);
  return NextResponse.json(
    await catalogService.setProductActive(await requireToken(), id, active),
  );
});
