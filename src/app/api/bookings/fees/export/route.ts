import { NextResponse } from "next/server";
import {
  FEE_SITUATIONS,
  toFeeFilter,
  type FeeSituation,
} from "@/features/bookings/model/fee-filter-params";
import { feesCsv } from "@/features/bookings/model/fees-csv";
import { bffRoute, requireToken } from "@/server/http/route-handler";
import { bookingsService } from "@/server/services/bookings.service";
import { isMonth } from "@/shared/lib/datetime";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const id = (value: string | null) =>
  value && UUID.test(value) ? value : undefined;

// Every usage fee of a month that matches the page's filters, as a
// spreadsheet (CSV) to send to the condominium's billing.
export const GET = bffRoute(async (request) => {
  const query = request.nextUrl.searchParams;
  const asked = query.get("mes") ?? undefined;
  const month = isMonth(asked) ? asked : undefined;
  const situation = query.get("situacao");
  const filter = toFeeFilter({
    unidade: id(query.get("unidade")),
    espaco: id(query.get("espaco")),
    morador: id(query.get("morador")),
    situacao:
      situation && situation in FEE_SITUATIONS
        ? (situation as FeeSituation)
        : undefined,
  });
  const fees = await bookingsService.fees(await requireToken(), month, filter);
  return new NextResponse(feesCsv(fees.items), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="taxas-${fees.month}.csv"`,
      "Cache-Control": "no-store",
    },
  });
});
