import { NextResponse } from "next/server";
import { bffRoute, readBody, requireToken } from "@/server/http/route-handler";
import { registerParcelSchema } from "@/server/http/schemas/parcels.schema";
import { parcelsService } from "@/server/services/parcels.service";

// Registers a parcel received for a unit (the residents are told).
export const POST = bffRoute(async (request) => {
  const input = await readBody(request, registerParcelSchema);
  return NextResponse.json(
    await parcelsService.register(await requireToken(), input),
  );
});
