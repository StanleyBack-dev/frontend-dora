import { NextResponse } from "next/server";
import { bffRoute, readBody, requireToken } from "@/server/http/route-handler";
import {
  lostReportIdSchema,
  spotLostReportSchema,
} from "@/server/http/schemas/lost-and-found.schema";
import { lostReportsService } from "@/server/services/lost-reports.service";

// "Achei isso": a neighbour found an item of the board (the owner and the
// desk are told).
export const POST = bffRoute<{ id: string }>(async (request, { params }) => {
  const id = lostReportIdSchema.parse((await params).id);
  const { note } = await readBody(request, spotLostReportSchema);
  await lostReportsService.spot(await requireToken(), id, note ?? null);
  return NextResponse.json({ ok: true });
});
