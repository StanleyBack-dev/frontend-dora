import { NextResponse } from "next/server";
import { bffRoute, requireToken } from "@/server/http/route-handler";
import { foundItemIdSchema } from "@/server/http/schemas/lost-and-found.schema";
import { lostAndFoundService } from "@/server/services/lost-and-found.service";

// The return receipt as a PDF to download (the API builds it and checks
// who may see the return).
export const GET = bffRoute<{ id: string }>(async (_request, { params }) => {
  const id = foundItemIdSchema.parse((await params).id);
  const file = await lostAndFoundService.receiptPdf(await requireToken(), id);
  return new NextResponse(new Uint8Array(file.content), {
    headers: {
      "Content-Type": file.mimeType,
      "Content-Disposition": `attachment; filename="${file.fileName}"`,
      "Cache-Control": "no-store",
    },
  });
});
