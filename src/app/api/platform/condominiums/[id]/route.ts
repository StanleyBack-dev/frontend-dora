import { NextResponse } from "next/server";
import { bffRoute, requireToken } from "@/server/http/route-handler";
import {
  condominiumIdSchema,
  condominiumInputSchema,
  condominiumStatusSchema,
} from "@/server/http/schemas/condominiums.schema";
import { condominiumsService } from "@/server/services/condominiums.service";

/** Edits the data, or (with only `status`) suspends / reactivates. */
export const PATCH = bffRoute<{ id: string }>(async (request, { params }) => {
  const id = condominiumIdSchema.parse((await params).id);
  const body: unknown = await request.json().catch(() => null);
  const token = await requireToken();
  const status = condominiumStatusSchema.safeParse(body);
  if (status.success) {
    return NextResponse.json(
      await condominiumsService.setStatus(token, id, status.data.status),
    );
  }
  return NextResponse.json(
    await condominiumsService.update(
      token,
      id,
      condominiumInputSchema.parse(body),
    ),
  );
});
