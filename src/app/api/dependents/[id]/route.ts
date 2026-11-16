import { NextResponse } from "next/server";
import { bffRoute, requireToken } from "@/server/http/route-handler";
import { dependentIdSchema } from "@/server/http/schemas/dependents.schema";
import { dependentsService } from "@/server/services/dependents.service";

export const DELETE = bffRoute<{ id: string }>(async (_request, { params }) => {
  const id = dependentIdSchema.parse((await params).id);
  await dependentsService.remove(await requireToken(), id);
  return NextResponse.json({ ok: true });
});
