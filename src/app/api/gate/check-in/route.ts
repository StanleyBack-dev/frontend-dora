import { NextResponse } from "next/server";
import { bffRoute, readBody, requireToken } from "@/server/http/route-handler";
import { checkInSchema } from "@/server/http/schemas/bookings.schema";
import { bookingsService } from "@/server/services/bookings.service";

// Lets a guest in, by the invite's code or from the list.
export const POST = bffRoute(async (request) => {
  const target = await readBody(request, checkInSchema);
  return NextResponse.json(
    await bookingsService.checkIn(await requireToken(), target),
  );
});
