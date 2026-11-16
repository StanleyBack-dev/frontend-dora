import { NextResponse } from "next/server";
import { bffRoute, readBody, requireToken } from "@/server/http/route-handler";
import { pixReceiverSchema } from "@/server/http/schemas/events.schema";
import { paymentsService } from "@/server/services/payments.service";

// The condominium's PIX (the API checks PAYMENTS_MANAGE).
export const PUT = bffRoute(async (request) => {
  const input = await readBody(request, pixReceiverSchema);
  return NextResponse.json(
    await paymentsService.setCondominiumPix(await requireToken(), input),
  );
});

export const DELETE = bffRoute(async () => {
  await paymentsService.removeCondominiumPix(await requireToken());
  return NextResponse.json({ ok: true });
});
