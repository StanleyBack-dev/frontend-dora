import { NextResponse } from "next/server";
import { bffRoute, requireToken } from "@/server/http/route-handler";
import { recipientSearchSchema } from "@/server/http/schemas/parcels.schema";
import { parcelsService } from "@/server/services/parcels.service";

// Residents found by part of their name, to register a parcel for them.
export const GET = bffRoute(async (request) => {
  const search = recipientSearchSchema.parse(
    request.nextUrl.searchParams.get("search") ?? "",
  );
  return NextResponse.json(
    await parcelsService.recipients(await requireToken(), search),
  );
});
