import { NextResponse } from "next/server";
import { bffRoute, readBody, requireToken } from "@/server/http/route-handler";
import {
  bookingGuestsSchema,
  bookingIdSchema,
} from "@/server/http/schemas/bookings.schema";
import { bookingsService } from "@/server/services/bookings.service";

// The guest list of a booking (the API checks who may see and change it).
export const GET = bffRoute<{ id: string }>(async (_request, { params }) => {
  const id = bookingIdSchema.parse((await params).id);
  return NextResponse.json(
    await bookingsService.guests(await requireToken(), id),
  );
});

export const POST = bffRoute<{ id: string }>(async (request, { params }) => {
  const id = bookingIdSchema.parse((await params).id);
  const { guests } = await readBody(request, bookingGuestsSchema);
  return NextResponse.json(
    await bookingsService.addGuests(await requireToken(), id, guests),
  );
});
