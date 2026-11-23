import { NextResponse } from "next/server";
import { bffRoute, readBody, requireToken } from "@/server/http/route-handler";
import { idSchema } from "@/server/http/schemas/fields";
import {
  paymentSchema,
  rescheduleSchema,
} from "@/server/http/schemas/purchase-orders.schema";
import { purchaseRequestIdSchema } from "@/server/http/schemas/purchase-requests.schema";
import { purchasePaymentsService } from "@/server/services/purchase-payments.service";

type Params = { id: string; installmentId: string };

/** Marks an installment paid, with the proof. */
export const POST = bffRoute<Params>(async (request, { params }) => {
  const { id, installmentId } = await params;
  const { file, ...input } = await readBody(request, paymentSchema);
  return NextResponse.json(
    await purchasePaymentsService.pay(
      await requireToken(),
      purchaseRequestIdSchema.parse(id),
      idSchema.parse(installmentId),
      input,
      file,
    ),
  );
});

/** Undoes a payment marked by mistake. */
export const DELETE = bffRoute<Params>(async (_request, { params }) => {
  const { id, installmentId } = await params;
  return NextResponse.json(
    await purchasePaymentsService.unpay(
      await requireToken(),
      purchaseRequestIdSchema.parse(id),
      idSchema.parse(installmentId),
    ),
  );
});

/** Moves an unpaid installment's due day. */
export const PATCH = bffRoute<Params>(async (request, { params }) => {
  const { id, installmentId } = await params;
  const { dueOn } = await readBody(request, rescheduleSchema);
  return NextResponse.json(
    await purchasePaymentsService.reschedule(
      await requireToken(),
      purchaseRequestIdSchema.parse(id),
      idSchema.parse(installmentId),
      dueOn,
    ),
  );
});
