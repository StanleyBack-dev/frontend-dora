import { NextResponse } from "next/server";
import { bffRoute, requireToken } from "@/server/http/route-handler";
import { ownerSearchSchema } from "@/server/http/schemas/lost-and-found.schema";
import { lostAndFoundService } from "@/server/services/lost-and-found.service";

// Residents found by part of their name, to say whose a found item is.
export const GET = bffRoute(async (request) => {
  const search = ownerSearchSchema.parse(
    request.nextUrl.searchParams.get("search") ?? "",
  );
  return NextResponse.json(
    await lostAndFoundService.owners(await requireToken(), search),
  );
});
