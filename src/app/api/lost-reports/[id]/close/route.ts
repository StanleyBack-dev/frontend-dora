import { NextResponse } from "next/server";
import { bffRoute, readBody, requireToken } from "@/server/http/route-handler";
import {
  closeLostReportSchema,
  lostReportIdSchema,
} from "@/server/http/schemas/lost-and-found.schema";
import { lostReportsService } from "@/server/services/lost-reports.service";

// Ends the caller's "Perdi algo": got it back, or stopped looking.
export const POST = bffRoute<{ id: string }>(async (request, { params }) => {
  const id = lostReportIdSchema.parse((await params).id);
  const { found } = await readBody(request, closeLostReportSchema);
  return NextResponse.json(
    await lostReportsService.close(await requireToken(), id, found),
  );
});
