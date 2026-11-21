import { NextResponse } from "next/server";
import { bffRoute, readBody, requireToken } from "@/server/http/route-handler";
import { reportLostItemSchema } from "@/server/http/schemas/lost-and-found.schema";
import { lostReportsService } from "@/server/services/lost-reports.service";

// "Perdi algo": says what the caller lost (told when an item of that
// category is found).
export const POST = bffRoute(async (request) => {
  const input = await readBody(request, reportLostItemSchema);
  return NextResponse.json(
    await lostReportsService.report(await requireToken(), {
      category: input.category,
      title: input.title,
      description: input.description ?? null,
      lostLocation: input.lostLocation ?? null,
      lostOn: input.lostOn ?? null,
      photo: input.photo ?? null,
      shared: input.shared,
    }),
  );
});
