import { NextResponse } from "next/server";
import { bffRoute, readBody, requireToken } from "@/server/http/route-handler";
import { ratingSchema } from "@/server/http/schemas/purchase-orders.schema";
import { purchaseRequestIdSchema } from "@/server/http/schemas/purchase-requests.schema";
import { purchaseOrdersService } from "@/server/services/purchase-orders.service";

/** Rates the supplier of a completed purchase. */
export const PUT = bffRoute<{ id: string }>(async (request, { params }) => {
  const requestId = purchaseRequestIdSchema.parse((await params).id);
  const body = await readBody(request, ratingSchema);
  return NextResponse.json(
    await purchaseOrdersService.rate(
      await requireToken(),
      requestId,
      body.rating,
      body.comment,
    ),
  );
});
