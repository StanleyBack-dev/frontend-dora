import { NextResponse } from "next/server";
import { bffRoute, readBody, requireToken } from "@/server/http/route-handler";
import {
  supporterIdSchema,
  supporterSchema,
} from "@/server/http/schemas/supporters.schema";
import { supportersService } from "@/server/services/supporters.service";

export const PATCH = bffRoute<{ id: string }>(async (request, { params }) => {
  const id = supporterIdSchema.parse((await params).id);
  const input = await readBody(request, supporterSchema);
  await supportersService.update(await requireToken(), id, input);
  return NextResponse.json({ ok: true });
});

export const DELETE = bffRoute<{ id: string }>(async (_request, { params }) => {
  const id = supporterIdSchema.parse((await params).id);
  await supportersService.remove(await requireToken(), id);
  return NextResponse.json({ ok: true });
});
