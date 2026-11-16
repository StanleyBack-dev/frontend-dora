import { NextResponse } from "next/server";
import { bffRoute, readBody, requireToken } from "@/server/http/route-handler";
import { ticketCheckInSchema } from "@/server/http/schemas/events.schema";
import { eventsService } from "@/server/services/events.service";

// Lets a ticket in, by its code or from the list.
export const POST = bffRoute(async (request) => {
  const target = await readBody(request, ticketCheckInSchema);
  return NextResponse.json(
    await eventsService.checkInTicket(await requireToken(), target),
  );
});
