import { NextResponse } from "next/server";
import { bffRoute, requireToken } from "@/server/http/route-handler";
import { supporterIdSchema } from "@/server/http/schemas/supporters.schema";
import { supportersService } from "@/server/services/supporters.service";

export const DELETE = bffRoute<{ id: string }>(async (_request, { params }) => {
  const id = supporterIdSchema.parse((await params).id);
  await supportersService.removeContribution(await requireToken(), id);
  return NextResponse.json({ ok: true });
});
