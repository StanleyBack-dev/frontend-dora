import { NextResponse } from "next/server";
import { bffRoute, requireToken } from "@/server/http/route-handler";
import { eventIdSchema } from "@/server/http/schemas/events.schema";
import { eventsService } from "@/server/services/events.service";

export const POST = bffRoute<{ id: string }>(async (_request, { params }) => {
  const id = eventIdSchema.parse((await params).id);
  return NextResponse.json(
    await eventsService.publish(await requireToken(), id),
  );
});
