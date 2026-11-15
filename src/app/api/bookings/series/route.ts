import { NextResponse } from "next/server";
import { bffRoute, readBody, requireToken } from "@/server/http/route-handler";
import { bookingSeriesSchema } from "@/server/http/schemas/bookings.schema";
import { bookingsService } from "@/server/services/bookings.service";

// A weekly booking: the same slot for several weeks.
export const POST = bffRoute(async (request) => {
  const input = await readBody(request, bookingSeriesSchema);
  return NextResponse.json(
    await bookingsService.createSeries(await requireToken(), input),
  );
});
