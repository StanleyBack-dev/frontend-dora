import "server-only";
import { z } from "zod";
import { enumLike } from "@/server/http/schemas/fields";
import type { BroadcastAudience } from "@/shared/contracts/broadcasts";
import type { UserGroup } from "@/shared/contracts/api";

export const broadcastSchema = z.object({
  title: z.string().trim().min(3).max(120),
  body: z.string().trim().min(3).max(2000),
  audience: enumLike<BroadcastAudience>(),
  targetGroup: enumLike<UserGroup>()
    .nullish()
    .transform((value) => value ?? null),
  sendEmail: z.boolean(),
});
