import { NextResponse } from "next/server";
import { bffRoute, readBody, requireToken } from "@/server/http/route-handler";
import { createBookingSchema } from "@/server/http/schemas/bookings.schema";
import { bookingsService } from "@/server/services/bookings.service";

export const POST = bffRoute(async (request) => {
  const input = await readBody(request, createBookingSchema);
  return NextResponse.json(
    await bookingsService.create(await requireToken(), input),
  );
});
