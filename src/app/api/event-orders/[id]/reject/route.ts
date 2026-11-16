import { NextResponse } from "next/server";
import { bffRoute, readBody, requireToken } from "@/server/http/route-handler";
import {
  orderIdSchema,
  rejectOrderSchema,
} from "@/server/http/schemas/events.schema";
import { eventsService } from "@/server/services/events.service";

export const POST = bffRoute<{ id: string }>(async (request, { params }) => {
  const id = orderIdSchema.parse((await params).id);
  const { reason } = await readBody(request, rejectOrderSchema);
  return NextResponse.json(
    await eventsService.rejectOrder(await requireToken(), id, reason),
  );
});
