import { NextResponse } from "next/server";
import { bffRoute, readBody, requireToken } from "@/server/http/route-handler";
import {
  createOrderSchema,
  eventIdSchema,
  orderStatusSchema,
} from "@/server/http/schemas/events.schema";
import { eventsService } from "@/server/services/events.service";

// GET: the event's orders (whoever reviews payments; ?status= filters).
export const GET = bffRoute<{ id: string }>(async (request, { params }) => {
  const id = eventIdSchema.parse((await params).id);
  const raw = new URL(request.url).searchParams.get("status");
  const status = raw ? orderStatusSchema.parse(raw) : null;
  return NextResponse.json(
    await eventsService.orders(await requireToken(), id, status),
  );
});

// POST: the caller orders places (paid: held 48 h for the receipt).
export const POST = bffRoute<{ id: string }>(async (request, { params }) => {
  const id = eventIdSchema.parse((await params).id);
  const { attendees } = await readBody(request, createOrderSchema);
  return NextResponse.json(
    await eventsService.createOrder(await requireToken(), id, attendees),
  );
});
