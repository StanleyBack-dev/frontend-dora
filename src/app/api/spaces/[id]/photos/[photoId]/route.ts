import { NextResponse } from "next/server";
import { bffRoute, requireToken } from "@/server/http/route-handler";
import { spaceIdSchema } from "@/server/http/schemas/spaces.schema";
import { spacesService } from "@/server/services/spaces.service";

export const DELETE = bffRoute<{ id: string; photoId: string }>(
  async (_request, { params }) => {
    const { id, photoId } = await params;
    return NextResponse.json(
      await spacesService.removePhoto(
        await requireToken(),
        spaceIdSchema.parse(id),
        spaceIdSchema.parse(photoId),
      ),
    );
  },
);
