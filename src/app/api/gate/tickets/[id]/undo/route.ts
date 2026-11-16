import { NextResponse } from "next/server";
import { bffRoute, requireToken } from "@/server/http/route-handler";
import { attendeeIdSchema } from "@/server/http/schemas/events.schema";
import { eventsService } from "@/server/services/events.service";

// Undoes a ticket's entry tapped by mistake.
export const POST = bffRoute<{ id: string }>(async (_request, { params }) => {
  const id = attendeeIdSchema.parse((await params).id);
  return NextResponse.json(
    await eventsService.undoTicketCheckIn(await requireToken(), id),
  );
});
