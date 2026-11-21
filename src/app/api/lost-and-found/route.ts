import { NextResponse } from "next/server";
import { bffRoute, readBody, requireToken } from "@/server/http/route-handler";
import { registerFoundItemSchema } from "@/server/http/schemas/lost-and-found.schema";
import { lostAndFoundService } from "@/server/services/lost-and-found.service";

// Registers an item found in the condominium (the residents are not told).
export const POST = bffRoute(async (request) => {
  const input = await readBody(request, registerFoundItemSchema);
  return NextResponse.json(
    await lostAndFoundService.register(await requireToken(), input),
  );
});
