import { NextResponse } from "next/server";
import { bffRoute, readBody, requireToken } from "@/server/http/route-handler";
import { spaceInputSchema } from "@/server/http/schemas/spaces.schema";
import { spacesService } from "@/server/services/spaces.service";

export const POST = bffRoute(async (request) => {
  const input = await readBody(request, spaceInputSchema);
  return NextResponse.json(
    await spacesService.create(await requireToken(), input),
  );
});
