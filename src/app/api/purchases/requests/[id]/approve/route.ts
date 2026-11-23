import { NextResponse } from "next/server";
import { bffRoute, readBody, requireToken } from "@/server/http/route-handler";
import { approvePurchaseSchema } from "@/server/http/schemas/purchase-approvals.schema";
import { purchaseRequestIdSchema } from "@/server/http/schemas/purchase-requests.schema";
import { purchaseApprovalsService } from "@/server/services/purchase-approvals.service";

/** Approves the chosen quote (an optional note). */
export const POST = bffRoute<{ id: string }>(async (request, { params }) => {
  const requestId = purchaseRequestIdSchema.parse((await params).id);
  const body = await readBody(request, approvePurchaseSchema);
  await purchaseApprovalsService.approve(
    await requireToken(),
    requestId,
    body.note,
  );
  return NextResponse.json({ ok: true });
});
