import { NextResponse } from "next/server";
import { bffRoute, readBody, requireToken } from "@/server/http/route-handler";
import {
  authorizePickupSchema,
  parcelIdSchema,
} from "@/server/http/schemas/parcels.schema";
import { parcelsService } from "@/server/services/parcels.service";

// Someone else may pick up the parcel (POST sets or replaces, DELETE
// removes); the API checks who sees it and that it still waits.
export const POST = bffRoute<{ id: string }>(async (request, { params }) => {
  const id = parcelIdSchema.parse((await params).id);
  const input = await readBody(request, authorizePickupSchema);
  return NextResponse.json(
    await parcelsService.authorize(await requireToken(), id, input),
  );
});

export const DELETE = bffRoute<{ id: string }>(async (_request, { params }) => {
  const id = parcelIdSchema.parse((await params).id);
  return NextResponse.json(
    await parcelsService.revokeAuthorization(await requireToken(), id),
  );
});
