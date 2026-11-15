import { NextResponse } from "next/server";
import { bffRoute, readBody, requireToken } from "@/server/http/route-handler";
import { supportContributionSchema } from "@/server/http/schemas/supporters.schema";
import { supportersService } from "@/server/services/supporters.service";

// Records a contribution (the API checks SUPPORTERS_MANAGE).
export const POST = bffRoute(async (request) => {
  const input = await readBody(request, supportContributionSchema);
  await supportersService.record(await requireToken(), input);
  return NextResponse.json({ ok: true });
});
