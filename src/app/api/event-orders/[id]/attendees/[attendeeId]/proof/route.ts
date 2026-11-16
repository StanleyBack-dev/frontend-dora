import { NextResponse } from "next/server";
import { bffRoute, readBody, requireToken } from "@/server/http/route-handler";
import {
  attendeeIdSchema,
  orderIdSchema,
  receiptSchema,
} from "@/server/http/schemas/events.schema";
import { eventsService } from "@/server/services/events.service";

// A person's document (image or PDF, base64; the API checks the content).
export const POST = bffRoute<{ id: string; attendeeId: string }>(
  async (request, { params }) => {
    const { id, attendeeId } = await params;
    const { file } = await readBody(request, receiptSchema);
    return NextResponse.json(
      await eventsService.submitProof(
        await requireToken(),
        orderIdSchema.parse(id),
        attendeeIdSchema.parse(attendeeId),
        file,
      ),
    );
  },
);
