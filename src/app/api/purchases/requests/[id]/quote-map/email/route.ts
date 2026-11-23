import { NextResponse } from "next/server";
import { bffRoute, readBody, requireToken } from "@/server/http/route-handler";
import { shareQuoteMapSchema } from "@/server/http/schemas/purchase-quotes.schema";
import { purchaseRequestIdSchema } from "@/server/http/schemas/purchase-requests.schema";
import { purchaseQuotesService } from "@/server/services/purchase-quotes.service";

/** Sends the comparison map (PDF attached) by e-mail. */
export const POST = bffRoute<{ id: string }>(async (request, { params }) => {
  const requestId = purchaseRequestIdSchema.parse((await params).id);
  const input = await readBody(request, shareQuoteMapSchema);
  const sent = await purchaseQuotesService.shareMapByEmail(
    await requireToken(),
    requestId,
    input,
  );
  return NextResponse.json({ sent });
});
