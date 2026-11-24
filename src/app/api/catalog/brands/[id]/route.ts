import { NextResponse } from "next/server";
import { bffRoute, readBody, requireToken } from "@/server/http/route-handler";
import {
  brandNameSchema,
  catalogActiveSchema,
  catalogIdSchema,
} from "@/server/http/schemas/catalog.schema";
import { catalogService } from "@/server/services/catalog.service";

/** Renames the brand. */
export const PUT = bffRoute<{ id: string }>(async (request, { params }) => {
  const id = catalogIdSchema.parse((await params).id);
  const { name } = await readBody(request, brandNameSchema);
  return NextResponse.json(
    await catalogService.renameBrand(await requireToken(), id, name),
  );
});

/** Activates or deactivates (an inactive one stays in the history). */
export const PATCH = bffRoute<{ id: string }>(async (request, { params }) => {
  const id = catalogIdSchema.parse((await params).id);
  const { active } = await readBody(request, catalogActiveSchema);
  return NextResponse.json(
    await catalogService.setBrandActive(await requireToken(), id, active),
  );
});
