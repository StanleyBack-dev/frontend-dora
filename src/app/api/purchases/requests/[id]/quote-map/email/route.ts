import { NextResponse } from "next/server";
import { bffRoute, readBody, requireToken } from "@/server/http/route-handler";
import { purchaseEmailSchema } from "@/server/http/schemas/purchase-email.schema";
import { purchaseRequestIdSchema } from "@/server/http/schemas/purchase-requests.schema";
import { purchaseQuotesService } from "@/server/services/purchase-quotes.service";

/** Sends the comparison map (PDF attached) by e-mail. */
export const POST = bffRoute<{ id: string }>(async (request, { params }) => {
  const requestId = purchaseRequestIdSchema.parse((await params).id);
  const input = await readBody(request, purchaseEmailSchema);
  const sent = await purchaseQuotesService.shareMapByEmail(
    await requireToken(),
    requestId,
    input,
  );
  return NextResponse.json({ sent });
});
