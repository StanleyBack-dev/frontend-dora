import { NextResponse } from "next/server";
import { bffRoute, readBody, requireToken } from "@/server/http/route-handler";
import { addPurchaseQuoteSchema } from "@/server/http/schemas/purchase-quotes.schema";
import { purchaseRequestIdSchema } from "@/server/http/schemas/purchase-requests.schema";
import { purchaseQuotesService } from "@/server/services/purchase-quotes.service";

/** Records a supplier's quote for the request. */
export const POST = bffRoute<{ id: string }>(async (request, { params }) => {
  const requestId = purchaseRequestIdSchema.parse((await params).id);
  const { supplierId, file, ...input } = await readBody(
    request,
    addPurchaseQuoteSchema,
  );
  return NextResponse.json(
    await purchaseQuotesService.add(
      await requireToken(),
      requestId,
      supplierId,
      input,
      file,
    ),
  );
});
