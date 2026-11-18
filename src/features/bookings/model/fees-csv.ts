import { formatBookingPeriod } from "@/features/bookings/model/booking-labels";
import type { Booking } from "@/shared/contracts/bookings";

/** One CSV cell: quoted, inner quotes doubled. */
const cell = (value: string) => `"${value.replace(/"/g, '""')}"`;

/**
 * The usage fees as a spreadsheet (CSV) for the condominium's billing:
 * a BOM so Excel opens the accents right and ";" as Brazilian Excel
 * expects.
 */
export function feesCsv(items: Booking[]): string {
  const rows = [
    ["Unidade", "Morador", "Espaço", "Quando", "Valor (R$)", "Situação"],
    ...items.map((item) => [
      item.unitLabel ?? "",
      item.userName,
      item.spaceName,
      formatBookingPeriod(item),
      ((item.feeCents ?? 0) / 100).toFixed(2).replace(".", ","),
      item.feeBilledAt ? "Lançada" : "Pendente",
    ]),
  ];
  return `﻿${rows.map((row) => row.map(cell).join(";")).join("\r\n")}`;
}
