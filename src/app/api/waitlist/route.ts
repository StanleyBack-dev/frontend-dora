import { NextResponse } from "next/server";
import { bffRoute, readBody, requireToken } from "@/server/http/route-handler";
import { waitlistSlotSchema } from "@/server/http/schemas/bookings.schema";
import { bookingsService } from "@/server/services/bookings.service";

// The waiting list of a taken slot: join (POST) or leave (DELETE).
export const POST = bffRoute(async (request) => {
  const slot = await readBody(request, waitlistSlotSchema);
  await bookingsService.joinWaitlist(await requireToken(), slot);
  return NextResponse.json({ ok: true });
});

export const DELETE = bffRoute(async (request) => {
  const slot = await readBody(request, waitlistSlotSchema);
  await bookingsService.leaveWaitlist(await requireToken(), slot);
  return NextResponse.json({ ok: true });
});
