import { NextResponse } from "next/server";
import { bffRoute, requireToken } from "@/server/http/route-handler";
import { availabilityQuerySchema } from "@/server/http/schemas/bookings.schema";
import { spaceIdSchema } from "@/server/http/schemas/spaces.schema";
import { bookingsService } from "@/server/services/bookings.service";

// The slot grid of one day (the calendar switches days without a reload).
export const GET = bffRoute<{ id: string }>(async (request, { params }) => {
  const spaceId = spaceIdSchema.parse((await params).id);
  const { date } = availabilityQuerySchema.parse({
    date: request.nextUrl.searchParams.get("date"),
  });
  return NextResponse.json(
    await bookingsService.availability(await requireToken(), spaceId, date),
  );
});
