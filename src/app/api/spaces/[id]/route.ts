import { NextResponse } from "next/server";
import { bffRoute, readBody, requireToken } from "@/server/http/route-handler";
import {
  spaceActiveSchema,
  spaceIdSchema,
  spaceInputSchema,
} from "@/server/http/schemas/spaces.schema";
import { spacesService } from "@/server/services/spaces.service";

/** Saves the whole form. */
export const PUT = bffRoute<{ id: string }>(async (request, { params }) => {
  const id = spaceIdSchema.parse((await params).id);
  const input = await readBody(request, spaceInputSchema);
  return NextResponse.json(
    await spacesService.update(await requireToken(), id, input),
  );
});

/** Activates or deactivates (maintenance). */
export const PATCH = bffRoute<{ id: string }>(async (request, { params }) => {
  const id = spaceIdSchema.parse((await params).id);
  const { active } = await readBody(request, spaceActiveSchema);
  return NextResponse.json(
    await spacesService.setActive(await requireToken(), id, active),
  );
});

export const DELETE = bffRoute<{ id: string }>(async (_request, { params }) => {
  const id = spaceIdSchema.parse((await params).id);
  await spacesService.remove(await requireToken(), id);
  return NextResponse.json({ ok: true });
});
