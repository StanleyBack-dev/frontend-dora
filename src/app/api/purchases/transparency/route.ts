import { NextResponse } from "next/server";
import { bffRoute, readBody, requireToken } from "@/server/http/route-handler";
import { publishTransparencySchema } from "@/server/http/schemas/purchase-indicators.schema";
import { purchaseIndicatorsService } from "@/server/services/purchase-indicators.service";

/** Publishes or withdraws the residents' purchases accounts (approvers). */
export const PUT = bffRoute(async (request) => {
  const { enabled } = await readBody(request, publishTransparencySchema);
  return NextResponse.json(
    await purchaseIndicatorsService.publish(await requireToken(), enabled),
  );
});
