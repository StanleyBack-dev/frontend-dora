import { NextResponse } from "next/server";
import { bffRoute, requireToken } from "@/server/http/route-handler";
import { idSchema } from "@/server/http/schemas/fields";
import { purchaseRequestIdSchema } from "@/server/http/schemas/purchase-requests.schema";
import { purchaseOrdersService } from "@/server/services/purchase-orders.service";

/** Removes a delivery recorded by mistake. */
export const DELETE = bffRoute<{ id: string; receiptId: string }>(
  async (_request, { params }) => {
    const { id, receiptId } = await params;
    return NextResponse.json(
      await purchaseOrdersService.removeReceipt(
        await requireToken(),
        purchaseRequestIdSchema.parse(id),
        idSchema.parse(receiptId),
      ),
    );
  },
);
