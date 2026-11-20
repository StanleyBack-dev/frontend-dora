import { NextResponse } from "next/server";
import { bffRoute, requireToken } from "@/server/http/route-handler";
import { parcelCodeSchema } from "@/server/http/schemas/parcels.schema";
import { parcelsService } from "@/server/services/parcels.service";

// The parcel of a pickup code (typed or read from the QR), to hand over.
export const GET = bffRoute(async (request) => {
  const code = parcelCodeSchema.parse(request.nextUrl.searchParams.get("code"));
  return NextResponse.json(
    await parcelsService.byCode(await requireToken(), code),
  );
});
