import { NextResponse } from "next/server";
import { bffRoute, readBody, requireToken } from "@/server/http/route-handler";
import { cancelOrderSchema } from "@/server/http/schemas/purchase-orders.schema";
import { purchaseRequestIdSchema } from "@/server/http/schemas/purchase-requests.schema";
import { purchaseOrdersService } from "@/server/services/purchase-orders.service";

/**
 * Cancels the order (nothing received nor paid), with the reason; back to
 * the quotes, there is no order page left (null).
 */
export const POST = bffRoute<{ id: string }>(async (request, { params }) => {
  const requestId = purchaseRequestIdSchema.parse((await params).id);
  const { reason, backToQuotes } = await readBody(request, cancelOrderSchema);
  return NextResponse.json(
    await purchaseOrdersService.cancel(
      await requireToken(),
      requestId,
      reason,
      backToQuotes,
    ),
  );
});
