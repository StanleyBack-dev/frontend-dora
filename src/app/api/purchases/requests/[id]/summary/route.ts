import { NextResponse } from "next/server";
import { bffRoute, requireToken } from "@/server/http/route-handler";
import { purchaseRequestIdSchema } from "@/server/http/schemas/purchase-requests.schema";
import { purchaseApprovalsService } from "@/server/services/purchase-approvals.service";

/** The purchase summary (resumo da compra) as a PDF to download. */
export const GET = bffRoute<{ id: string }>(async (_request, { params }) => {
  const requestId = purchaseRequestIdSchema.parse((await params).id);
  const file = await purchaseApprovalsService.summaryPdf(
    await requireToken(),
    requestId,
  );
  return new NextResponse(new Uint8Array(file.content), {
    headers: {
      "Content-Type": file.mimeType,
      "Content-Disposition": `attachment; filename="${file.fileName}"`,
      "Cache-Control": "no-store",
    },
  });
});
