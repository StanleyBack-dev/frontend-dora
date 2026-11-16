import { NextResponse } from "next/server";
import { bffRoute, readBody, requireToken } from "@/server/http/route-handler";
import {
  dependentIdSchema,
  rejectDependentSchema,
} from "@/server/http/schemas/dependents.schema";
import { dependentsService } from "@/server/services/dependents.service";

export const POST = bffRoute<{ id: string }>(async (request, { params }) => {
  const id = dependentIdSchema.parse((await params).id);
  const { reason } = await readBody(request, rejectDependentSchema);
  return NextResponse.json(
    await dependentsService.reject(await requireToken(), id, reason),
  );
});
