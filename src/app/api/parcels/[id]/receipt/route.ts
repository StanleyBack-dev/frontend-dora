import { NextResponse } from "next/server";
import { bffRoute, requireToken } from "@/server/http/route-handler";
import { parcelIdSchema } from "@/server/http/schemas/parcels.schema";
import { parcelsService } from "@/server/services/parcels.service";

// The pickup receipt as a PDF to download (the API builds it and checks
// who may see the parcel).
export const GET = bffRoute<{ id: string }>(async (_request, { params }) => {
  const id = parcelIdSchema.parse((await params).id);
  const file = await parcelsService.receiptPdf(await requireToken(), id);
  return new NextResponse(new Uint8Array(file.content), {
    headers: {
      "Content-Type": file.mimeType,
      "Content-Disposition": `attachment; filename="${file.fileName}"`,
      "Cache-Control": "no-store",
    },
  });
});
