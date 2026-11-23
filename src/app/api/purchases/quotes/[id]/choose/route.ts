import { NextResponse } from "next/server";
import { bffRoute, readBody, requireToken } from "@/server/http/route-handler";
import {
  choosePurchaseQuoteSchema,
  purchaseQuoteIdSchema,
} from "@/server/http/schemas/purchase-quotes.schema";
import { purchaseQuotesService } from "@/server/services/purchase-quotes.service";

/** Chooses the winning quote (the request then waits for the approval). */
export const POST = bffRoute<{ id: string }>(async (request, { params }) => {
  const id = purchaseQuoteIdSchema.parse((await params).id);
  const { justification } = await readBody(request, choosePurchaseQuoteSchema);
  await purchaseQuotesService.choose(await requireToken(), id, justification);
  return NextResponse.json({ ok: true });
});
