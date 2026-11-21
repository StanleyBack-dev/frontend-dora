import { NextResponse } from "next/server";
import { bffRoute, requireToken } from "@/server/http/route-handler";
import { foundItemClaimIdSchema } from "@/server/http/schemas/lost-and-found.schema";
import { lostAndFoundService } from "@/server/services/lost-and-found.service";

// Cancels one of the caller's claims still waiting.
export const POST = bffRoute<{ id: string }>(async (_request, { params }) => {
  const id = foundItemClaimIdSchema.parse((await params).id);
  return NextResponse.json(
    await lostAndFoundService.withdraw(await requireToken(), id),
  );
});
