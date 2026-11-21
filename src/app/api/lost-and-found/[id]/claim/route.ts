import { NextResponse } from "next/server";
import { bffRoute, readBody, requireToken } from "@/server/http/route-handler";
import {
  claimFoundItemSchema,
  foundItemIdSchema,
} from "@/server/http/schemas/lost-and-found.schema";
import { lostAndFoundService } from "@/server/services/lost-and-found.service";

// A resident says a kept item is theirs, describing it (the desk is told).
export const POST = bffRoute<{ id: string }>(async (request, { params }) => {
  const id = foundItemIdSchema.parse((await params).id);
  const { message } = await readBody(request, claimFoundItemSchema);
  return NextResponse.json(
    await lostAndFoundService.claim(await requireToken(), id, message),
  );
});
