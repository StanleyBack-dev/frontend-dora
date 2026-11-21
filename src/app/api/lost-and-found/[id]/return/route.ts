import { NextResponse } from "next/server";
import { bffRoute, readBody, requireToken } from "@/server/http/route-handler";
import {
  foundItemIdSchema,
  returnFoundItemSchema,
} from "@/server/http/schemas/lost-and-found.schema";
import { lostAndFoundService } from "@/server/services/lost-and-found.service";

// Hands a found item back with the signature drawn on the screen. The end
// user's IP and browser reach the API through the BFF's headers.
export const POST = bffRoute<{ id: string }>(async (request, { params }) => {
  const id = foundItemIdSchema.parse((await params).id);
  const input = await readBody(request, returnFoundItemSchema);
  return NextResponse.json(
    await lostAndFoundService.returnItem(await requireToken(), id, input),
  );
});
