import { NextResponse } from "next/server";
import { bffRoute, readBody, requireToken } from "@/server/http/route-handler";
import {
  closeParcelSchema,
  parcelIdSchema,
} from "@/server/http/schemas/parcels.schema";
import { parcelsService } from "@/server/services/parcels.service";

// Cancels a parcel registered by mistake, with the reason.
export const POST = bffRoute<{ id: string }>(async (request, { params }) => {
  const id = parcelIdSchema.parse((await params).id);
  const { reason } = await readBody(request, closeParcelSchema);
  return NextResponse.json(
    await parcelsService.cancel(await requireToken(), id, reason),
  );
});
