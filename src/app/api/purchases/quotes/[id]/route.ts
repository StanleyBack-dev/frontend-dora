import { NextResponse } from "next/server";
import { bffRoute, readBody, requireToken } from "@/server/http/route-handler";
import {
  purchaseQuoteIdSchema,
  updatePurchaseQuoteSchema,
} from "@/server/http/schemas/purchase-quotes.schema";
import { purchaseQuotesService } from "@/server/services/purchase-quotes.service";

/** Saves the quote's prices, terms and document. */
export const PUT = bffRoute<{ id: string }>(async (request, { params }) => {
  const id = purchaseQuoteIdSchema.parse((await params).id);
  const { file, removeFile, ...input } = await readBody(
    request,
    updatePurchaseQuoteSchema,
  );
  return NextResponse.json(
    await purchaseQuotesService.update(
      await requireToken(),
      id,
      input,
      file,
      removeFile,
    ),
  );
});

/** Removes the quote (with none left, the request waits for quotes again). */
export const DELETE = bffRoute<{ id: string }>(async (_request, { params }) => {
  const id = purchaseQuoteIdSchema.parse((await params).id);
  await purchaseQuotesService.remove(await requireToken(), id);
  return NextResponse.json({ ok: true });
});
