import { NextResponse } from "next/server";
import { bffRoute, readBody, requireToken } from "@/server/http/route-handler";
import {
  spaceIdSchema,
  spacePhotoSchema,
} from "@/server/http/schemas/spaces.schema";
import { spacesService } from "@/server/services/spaces.service";

export const POST = bffRoute<{ id: string }>(async (request, { params }) => {
  const id = spaceIdSchema.parse((await params).id);
  const { photo } = await readBody(request, spacePhotoSchema);
  return NextResponse.json(
    await spacesService.addPhoto(await requireToken(), id, photo),
  );
});
