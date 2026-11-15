import { NextResponse } from "next/server";
import { bffRoute, requireToken } from "@/server/http/route-handler";
import { gateDateSchema } from "@/server/http/schemas/bookings.schema";
import { bookingsService } from "@/server/services/bookings.service";

// The gate's list of the day (Portaria), refreshed by the page.
export const GET = bffRoute(async (request) => {
  const { date } = gateDateSchema.parse({
    date: request.nextUrl.searchParams.get("date") ?? undefined,
  });
  return NextResponse.json(
    await bookingsService.gateGuests(await requireToken(), date),
  );
});
