import { NextResponse } from "next/server";
import { bffRoute, readBody, requireToken } from "@/server/http/route-handler";
import { decisionReasonSchema } from "@/server/http/schemas/purchase-approvals.schema";
import { purchaseRequestIdSchema } from "@/server/http/schemas/purchase-requests.schema";
import { purchaseApprovalsService } from "@/server/services/purchase-approvals.service";

/** Rejects the purchase, with the reason (the request ends). */
export const POST = bffRoute<{ id: string }>(async (request, { params }) => {
  const requestId = purchaseRequestIdSchema.parse((await params).id);
  const body = await readBody(request, decisionReasonSchema);
  await purchaseApprovalsService.reject(
    await requireToken(),
    requestId,
    body.reason,
  );
  return NextResponse.json({ ok: true });
});
