import { NextResponse } from "next/server";
import { bffRoute, requireToken } from "@/server/http/route-handler";
import { bookingIdSchema } from "@/server/http/schemas/bookings.schema";
import { bookingsService } from "@/server/services/bookings.service";

export const POST = bffRoute<{ id: string }>(async (_request, { params }) => {
  const id = bookingIdSchema.parse((await params).id);
  return NextResponse.json(
    await bookingsService.approve(await requireToken(), id),
  );
});
