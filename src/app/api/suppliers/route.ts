import { NextResponse } from "next/server";
import { bffRoute, readBody, requireToken } from "@/server/http/route-handler";
import { supplierInputSchema } from "@/server/http/schemas/suppliers.schema";
import { suppliersService } from "@/server/services/suppliers.service";

/** Registers a supplier of the condominium. */
export const POST = bffRoute(async (request) => {
  const input = await readBody(request, supplierInputSchema);
  return NextResponse.json(
    await suppliersService.createSupplier(await requireToken(), {
      ...input,
      pixKeyType: input.pixKeyType ?? null,
    }),
  );
});
