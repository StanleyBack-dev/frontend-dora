import { NextResponse } from "next/server";
import { bffRoute, readBody, requireToken } from "@/server/http/route-handler";
import {
  decideClaimSchema,
  foundItemClaimIdSchema,
} from "@/server/http/schemas/lost-and-found.schema";
import { lostAndFoundService } from "@/server/services/lost-and-found.service";

// Accepts a claim (the resident may come for it) or rejects it with the
// reason (the resident is told either way).
export const POST = bffRoute<{ id: string }>(async (request, { params }) => {
  const id = foundItemClaimIdSchema.parse((await params).id);
  const { accept, note } = await readBody(request, decideClaimSchema);
  return NextResponse.json(
    await lostAndFoundService.decide(await requireToken(), id, accept, note),
  );
});
