import { NextResponse } from "next/server";
import { bffRoute, readBody, requireToken } from "@/server/http/route-handler";
import {
  closeFoundItemSchema,
  foundItemIdSchema,
} from "@/server/http/schemas/lost-and-found.schema";
import { lostAndFoundService } from "@/server/services/lost-and-found.service";

// Donates a found item nobody took, with the reason (open claims end).
export const POST = bffRoute<{ id: string }>(async (request, { params }) => {
  const id = foundItemIdSchema.parse((await params).id);
  const { reason } = await readBody(request, closeFoundItemSchema);
  return NextResponse.json(
    await lostAndFoundService.donate(await requireToken(), id, reason),
  );
});
