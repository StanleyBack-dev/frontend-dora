import { NextResponse } from "next/server";
import { bffRoute, requireToken } from "@/server/http/route-handler";
import { orderIdSchema } from "@/server/http/schemas/events.schema";
import { eventsService } from "@/server/services/events.service";

export const POST = bffRoute<{ id: string }>(async (_request, { params }) => {
  const id = orderIdSchema.parse((await params).id);
  return NextResponse.json(
    await eventsService.cancelOrder(await requireToken(), id),
  );
});
