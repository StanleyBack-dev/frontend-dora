import { NextResponse } from "next/server";
import { bffRoute, requireToken } from "@/server/http/route-handler";
import { dependentIdSchema } from "@/server/http/schemas/dependents.schema";
import { dependentsService } from "@/server/services/dependents.service";

export const POST = bffRoute<{ id: string }>(async (_request, { params }) => {
  const id = dependentIdSchema.parse((await params).id);
  return NextResponse.json(
    await dependentsService.approve(await requireToken(), id),
  );
});
