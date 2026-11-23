import { NextResponse } from "next/server";
import { bffRoute, readBody, requireToken } from "@/server/http/route-handler";
import { decisionReasonSchema } from "@/server/http/schemas/purchase-approvals.schema";
import { purchaseRequestIdSchema } from "@/server/http/schemas/purchase-requests.schema";
import { purchaseApprovalsService } from "@/server/services/purchase-approvals.service";

/** Sends the purchase back to quotes, with the reason. */
export const POST = bffRoute<{ id: string }>(async (request, { params }) => {
  const requestId = purchaseRequestIdSchema.parse((await params).id);
  const body = await readBody(request, decisionReasonSchema);
  await purchaseApprovalsService.returnToQuotes(
    await requireToken(),
    requestId,
    body.reason,
  );
  return NextResponse.json({ ok: true });
});
