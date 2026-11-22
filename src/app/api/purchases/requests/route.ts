import { NextResponse } from "next/server";
import { bffRoute, readBody, requireToken } from "@/server/http/route-handler";
import { purchaseRequestInputSchema } from "@/server/http/schemas/purchase-requests.schema";
import { purchaseRequestsService } from "@/server/services/purchase-requests.service";

/** Makes a purchase request (the management is told). */
export const POST = bffRoute(async (request) => {
  const input = await readBody(request, purchaseRequestInputSchema);
  return NextResponse.json(
    await purchaseRequestsService.create(await requireToken(), input),
  );
});
