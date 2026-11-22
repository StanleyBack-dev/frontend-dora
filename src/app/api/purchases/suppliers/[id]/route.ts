import { NextResponse } from "next/server";
import { bffRoute, readBody, requireToken } from "@/server/http/route-handler";
import {
  supplierActiveSchema,
  supplierIdSchema,
  supplierInputSchema,
} from "@/server/http/schemas/purchases.schema";
import { purchasesService } from "@/server/services/purchases.service";

/** Saves the whole form. */
export const PUT = bffRoute<{ id: string }>(async (request, { params }) => {
  const id = supplierIdSchema.parse((await params).id);
  const input = await readBody(request, supplierInputSchema);
  return NextResponse.json(
    await purchasesService.updateSupplier(await requireToken(), id, {
      ...input,
      pixKeyType: input.pixKeyType ?? null,
    }),
  );
});

/** Activates or deactivates (an inactive one stays in the history). */
export const PATCH = bffRoute<{ id: string }>(async (request, { params }) => {
  const id = supplierIdSchema.parse((await params).id);
  const { active } = await readBody(request, supplierActiveSchema);
  return NextResponse.json(
    await purchasesService.setSupplierActive(await requireToken(), id, active),
  );
});
