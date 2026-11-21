import { NextResponse } from "next/server";
import { bffRoute, requireToken } from "@/server/http/route-handler";
import { foundItemIdSchema } from "@/server/http/schemas/lost-and-found.schema";
import { lostAndFoundService } from "@/server/services/lost-and-found.service";

// Lifts an item's reservation: its owner says it is not theirs (the desk
// is told), or the desk opens it to everyone.
export const POST = bffRoute<{ id: string }>(async (_request, { params }) => {
  const id = foundItemIdSchema.parse((await params).id);
  return NextResponse.json(
    await lostAndFoundService.release(await requireToken(), id),
  );
});
