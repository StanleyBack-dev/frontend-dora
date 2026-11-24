import { NextResponse } from "next/server";
import { bffRoute, requireToken } from "@/server/http/route-handler";
import { purchaseRequestIdSchema } from "@/server/http/schemas/purchase-requests.schema";
import { purchaseQuotesService } from "@/server/services/purchase-quotes.service";

/**
 * The comparison map (mapa de cotação) as a PDF to download (the API
 * builds it, for the management).
 */
export const GET = bffRoute<{ id: string }>(async (_request, { params }) => {
  const requestId = purchaseRequestIdSchema.parse((await params).id);
  const file = await purchaseQuotesService.mapPdf(
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
