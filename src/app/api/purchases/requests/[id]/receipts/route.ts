import { NextResponse } from "next/server";
import { bffRoute, readBody, requireToken } from "@/server/http/route-handler";
import { receiptSchema } from "@/server/http/schemas/purchase-orders.schema";
import { purchaseRequestIdSchema } from "@/server/http/schemas/purchase-requests.schema";
import { purchaseOrdersService } from "@/server/services/purchase-orders.service";

/** Records a delivery (in part or in full), with the invoice. */
export const POST = bffRoute<{ id: string }>(async (request, { params }) => {
  const requestId = purchaseRequestIdSchema.parse((await params).id);
  const { file, ...input } = await readBody(request, receiptSchema);
  return NextResponse.json(
    await purchaseOrdersService.addReceipt(
      await requireToken(),
      requestId,
      input,
      file,
    ),
  );
});
