import { NextResponse } from "next/server";
import { bffRoute, requireToken } from "@/server/http/route-handler";
import { bookingIdSchema } from "@/server/http/schemas/bookings.schema";
import { bookingsService } from "@/server/services/bookings.service";

// Takes a guest off the list (the invite stops working).
export const DELETE = bffRoute<{ id: string }>(async (_request, { params }) => {
  const id = bookingIdSchema.parse((await params).id);
  await bookingsService.removeGuest(await requireToken(), id);
  return NextResponse.json({ ok: true });
});
