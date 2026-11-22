import { NextResponse } from "next/server";
import { bffRoute, readBody, requireToken } from "@/server/http/route-handler";
import {
  cancelPurchaseRequestSchema,
  purchaseRequestIdSchema,
} from "@/server/http/schemas/purchase-requests.schema";
import { purchaseRequestsService } from "@/server/services/purchase-requests.service";

/** Cancels a request waiting for quotes, with the reason. */
export const POST = bffRoute<{ id: string }>(async (request, { params }) => {
  const id = purchaseRequestIdSchema.parse((await params).id);
  const { reason } = await readBody(request, cancelPurchaseRequestSchema);
  return NextResponse.json(
    await purchaseRequestsService.cancel(await requireToken(), id, reason),
  );
});
