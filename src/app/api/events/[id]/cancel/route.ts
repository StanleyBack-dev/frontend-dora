import { NextResponse } from "next/server";
import { bffRoute, readBody, requireToken } from "@/server/http/route-handler";
import {
  cancelEventSchema,
  eventIdSchema,
} from "@/server/http/schemas/events.schema";
import { eventsService } from "@/server/services/events.service";

export const POST = bffRoute<{ id: string }>(async (request, { params }) => {
  const id = eventIdSchema.parse((await params).id);
  const { reason } = await readBody(request, cancelEventSchema);
  return NextResponse.json(
    await eventsService.cancel(await requireToken(), id, reason),
  );
});
