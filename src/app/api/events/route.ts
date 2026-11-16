import { NextResponse } from "next/server";
import { bffRoute, readBody, requireToken } from "@/server/http/route-handler";
import { eventInputSchema } from "@/server/http/schemas/events.schema";
import { eventsService } from "@/server/services/events.service";

// Creates an event as a draft (the API checks EVENTS_MANAGE and the module).
export const POST = bffRoute(async (request) => {
  const input = await readBody(request, eventInputSchema);
  return NextResponse.json(
    await eventsService.create(await requireToken(), input),
  );
});
