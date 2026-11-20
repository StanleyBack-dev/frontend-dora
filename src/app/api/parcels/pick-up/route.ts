import { NextResponse } from "next/server";
import { bffRoute, readBody, requireToken } from "@/server/http/route-handler";
import { pickUpParcelSchema } from "@/server/http/schemas/parcels.schema";
import { parcelsService } from "@/server/services/parcels.service";

// Hands a parcel over with the signature drawn on the screen. The end
// user's IP and browser reach the API through the BFF's headers.
export const POST = bffRoute(async (request) => {
  const input = await readBody(request, pickUpParcelSchema);
  return NextResponse.json(
    await parcelsService.pickUp(await requireToken(), input),
  );
});
