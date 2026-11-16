import { NextResponse } from "next/server";
import { bffRoute, readBody, requireToken } from "@/server/http/route-handler";
import {
  eventIdSchema,
  eventInputSchema,
} from "@/server/http/schemas/events.schema";
import { eventsService } from "@/server/services/events.service";

export const PATCH = bffRoute<{ id: string }>(async (request, { params }) => {
  const id = eventIdSchema.parse((await params).id);
  const input = await readBody(request, eventInputSchema);
  return NextResponse.json(
    await eventsService.update(await requireToken(), id, input),
  );
});
