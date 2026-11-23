import { NextResponse } from "next/server";
import { bffRoute, readBody, requireToken } from "@/server/http/route-handler";
import { placeOrderSchema } from "@/server/http/schemas/purchase-orders.schema";
import { purchaseRequestIdSchema } from "@/server/http/schemas/purchase-requests.schema";
import { purchaseOrdersService } from "@/server/services/purchase-orders.service";

/** Places the order of an approved purchase. */
export const POST = bffRoute<{ id: string }>(async (request, { params }) => {
  const requestId = purchaseRequestIdSchema.parse((await params).id);
  const input = await readBody(request, placeOrderSchema);
  return NextResponse.json(
    await purchaseOrdersService.place(await requireToken(), requestId, input),
  );
});

/** The purchase's order page data (e.g. what is still to arrive). */
export const GET = bffRoute<{ id: string }>(async (_request, { params }) => {
  const requestId = purchaseRequestIdSchema.parse((await params).id);
  return NextResponse.json(
    await purchaseOrdersService.view(await requireToken(), requestId),
  );
});
