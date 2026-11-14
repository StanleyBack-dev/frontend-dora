import { NextResponse } from "next/server";
import { bffRoute, readBody, requireToken } from "@/server/http/route-handler";
import { spaceBlockSchema } from "@/server/http/schemas/bookings.schema";
import { spaceIdSchema } from "@/server/http/schemas/spaces.schema";
import { bookingsService } from "@/server/services/bookings.service";

export const POST = bffRoute<{ id: string }>(async (request, { params }) => {
  const spaceId = spaceIdSchema.parse((await params).id);
  const input = await readBody(request, spaceBlockSchema);
  await bookingsService.createBlock(await requireToken(), spaceId, input);
  return NextResponse.json({ ok: true });
});
