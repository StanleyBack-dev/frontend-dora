import { NextResponse } from "next/server";
import { bffRoute, readBody, requireToken } from "@/server/http/route-handler";
import { purchaseSettingsSchema } from "@/server/http/schemas/purchase-approvals.schema";
import { purchaseApprovalsService } from "@/server/services/purchase-approvals.service";

/** Changes how purchases are approved (approvers only, checked by the API). */
export const PUT = bffRoute(async (request) => {
  const input = await readBody(request, purchaseSettingsSchema);
  return NextResponse.json(
    await purchaseApprovalsService.updateSettings(await requireToken(), {
      approvalMode: input.approvalMode,
      approvalLimitCents:
        input.approvalMode === "LIMIT" ? input.approvalLimitCents : null,
    }),
  );
});
