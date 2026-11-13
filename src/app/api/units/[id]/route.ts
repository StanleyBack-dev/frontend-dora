import { NextResponse } from "next/server";
import { bffRoute, readBody, requireToken } from "@/server/http/route-handler";
import {
  unitIdSchema,
  updateUnitSchema,
} from "@/server/http/schemas/condominiums.schema";
import { condominiumsService } from "@/server/services/condominiums.service";

export const PATCH = bffRoute<{ id: string }>(async (request, { params }) => {
  const id = unitIdSchema.parse((await params).id);
  const input = await readBody(request, updateUnitSchema);
  return NextResponse.json(
    await condominiumsService.updateUnit(await requireToken(), id, input),
  );
});

export const DELETE = bffRoute<{ id: string }>(async (_request, { params }) => {
  const id = unitIdSchema.parse((await params).id);
  await condominiumsService.deleteUnit(await requireToken(), id);
  return NextResponse.json({ ok: true });
});
