import { NextResponse } from "next/server";
import { bffRoute, readBody, requireToken } from "@/server/http/route-handler";
import {
  orderIdSchema,
  receiptSchema,
} from "@/server/http/schemas/events.schema";
import { eventsService } from "@/server/services/events.service";

export const POST = bffRoute<{ id: string }>(async (request, { params }) => {
  const id = orderIdSchema.parse((await params).id);
  const { file } = await readBody(request, receiptSchema);
  return NextResponse.json(
    await eventsService.submitReceipt(await requireToken(), id, file),
  );
});
