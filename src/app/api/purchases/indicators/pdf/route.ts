import { pdfResponse } from "@/server/http/pdf-response";
import { bffRoute, requireToken } from "@/server/http/route-handler";
import { periodQuerySchema } from "@/server/http/schemas/purchase-indicators.schema";
import { purchaseIndicatorsService } from "@/server/services/purchase-indicators.service";

/** The purchases indicators of a period as a PDF (A4 landscape). */
export const GET = bffRoute(async (request) => {
  const period = periodQuerySchema.parse(
    Object.fromEntries(request.nextUrl.searchParams),
  );
  return pdfResponse(
    await purchaseIndicatorsService.indicatorsPdf(await requireToken(), period),
  );
});
