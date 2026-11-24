import { NextResponse } from "next/server";
import { bffRoute, readBody, requireToken } from "@/server/http/route-handler";
import {
  purchaseRequestIdSchema,
  purchaseRequestInputSchema,
} from "@/server/http/schemas/purchase-requests.schema";
import { purchaseRequestsService } from "@/server/services/purchase-requests.service";

/** Saves the whole form (details and items) while waiting for quotes. */
export const PUT = bffRoute<{ id: string }>(async (request, { params }) => {
  const id = purchaseRequestIdSchema.parse((await params).id);
  const input = await readBody(request, purchaseRequestInputSchema);
  return NextResponse.json(
    await purchaseRequestsService.update(await requireToken(), id, input),
  );
});
