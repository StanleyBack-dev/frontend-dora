import { NextResponse } from "next/server";
import { bffRoute, readBody, requireToken } from "@/server/http/route-handler";
import {
  bookingIdSchema,
  bookingReasonSchema,
} from "@/server/http/schemas/bookings.schema";
import { bookingsService } from "@/server/services/bookings.service";

export const POST = bffRoute<{ id: string }>(async (request, { params }) => {
  const id = bookingIdSchema.parse((await params).id);
  const { reason } = await readBody(request, bookingReasonSchema);
  return NextResponse.json(
    await bookingsService.reject(await requireToken(), id, reason ?? ""),
  );
});
