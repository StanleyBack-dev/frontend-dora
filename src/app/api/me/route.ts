import { NextResponse } from "next/server";
import { z } from "zod";
import { bffRoute, readBody, requireToken } from "@/server/http/route-handler";
import { authService } from "@/server/services/auth.service";

const schema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.email().max(254),
  // Absent: unchanged; "" removes it (the API validates the digits).
  phone: z.string().trim().max(30).optional(),
  // Absent: unchanged; "" removes it (the API checks the date).
  birthDate: z
    .string()
    .trim()
    .regex(/^(\d{4}-\d{2}-\d{2})?$/)
    .optional(),
});

export const PATCH = bffRoute(async (request) => {
  const input = await readBody(request, schema);
  return NextResponse.json(
    await authService.updateProfile(await requireToken(), input),
  );
});
