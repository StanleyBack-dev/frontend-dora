import { NextResponse } from "next/server";
import { bffRoute, readBody, requireToken } from "@/server/http/route-handler";
import { dependentInputSchema } from "@/server/http/schemas/dependents.schema";
import { dependentsService } from "@/server/services/dependents.service";

// The caller's dependents: list and add (with the document).
export const GET = bffRoute(async () =>
  NextResponse.json(await dependentsService.mine(await requireToken())),
);

export const POST = bffRoute(async (request) => {
  const input = await readBody(request, dependentInputSchema);
  return NextResponse.json(
    await dependentsService.add(await requireToken(), input),
  );
});
