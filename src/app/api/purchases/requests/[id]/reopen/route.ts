import { NextResponse } from "next/server";
import { bffRoute, requireToken } from "@/server/http/route-handler";
import { purchaseRequestIdSchema } from "@/server/http/schemas/purchase-requests.schema";
import { purchaseQuotesService } from "@/server/services/purchase-quotes.service";

/** Undoes the chosen quote while waiting for the approval. */
export const POST = bffRoute<{ id: string }>(async (_request, { params }) => {
  const requestId = purchaseRequestIdSchema.parse((await params).id);
  await purchaseQuotesService.reopen(await requireToken(), requestId);
  return NextResponse.json({ ok: true });
});
