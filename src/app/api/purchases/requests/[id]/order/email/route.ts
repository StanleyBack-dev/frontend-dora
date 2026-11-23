import { NextResponse } from "next/server";
import { bffRoute, readBody, requireToken } from "@/server/http/route-handler";
import { purchaseEmailSchema } from "@/server/http/schemas/purchase-email.schema";
import { purchaseRequestIdSchema } from "@/server/http/schemas/purchase-requests.schema";
import { purchaseOrdersService } from "@/server/services/purchase-orders.service";

/** Sends the purchase order (PDF attached) by e-mail to the supplier. */
export const POST = bffRoute<{ id: string }>(async (request, { params }) => {
  const requestId = purchaseRequestIdSchema.parse((await params).id);
  const input = await readBody(request, purchaseEmailSchema);
  const sent = await purchaseOrdersService.sendByEmail(
    await requireToken(),
    requestId,
    input,
  );
  return NextResponse.json({ sent });
});
