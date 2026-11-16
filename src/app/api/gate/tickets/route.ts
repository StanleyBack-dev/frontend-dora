import { NextResponse } from "next/server";
import { bffRoute, requireToken } from "@/server/http/route-handler";
import { gateDateSchema } from "@/server/http/schemas/bookings.schema";
import { eventsService } from "@/server/services/events.service";

// The day's event tickets at the gate (Portaria), refreshed by the page.
export const GET = bffRoute(async (request) => {
  const { date } = gateDateSchema.parse({
    date: request.nextUrl.searchParams.get("date") ?? undefined,
  });
  return NextResponse.json(
    await eventsService.gateTickets(await requireToken(), date),
  );
});
