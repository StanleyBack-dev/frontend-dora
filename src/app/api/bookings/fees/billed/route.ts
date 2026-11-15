import { NextResponse } from "next/server";
import { bffRoute, readBody, requireToken } from "@/server/http/route-handler";
import { feesBilledSchema } from "@/server/http/schemas/bookings.schema";
import { bookingsService } from "@/server/services/bookings.service";

// Marks usage fees as sent to the condominium's billing (or undoes it).
export const POST = bffRoute(async (request) => {
  const { bookingIds, billed } = await readBody(request, feesBilledSchema);
  return NextResponse.json({
    changed: await bookingsService.setFeesBilled(
      await requireToken(),
      bookingIds,
      billed,
    ),
  });
});
