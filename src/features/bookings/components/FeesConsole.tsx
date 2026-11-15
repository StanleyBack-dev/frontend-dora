"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CircleCheck, Download, Undo2, Wallet } from "lucide-react";
import { Badge, Button, Card, EmptyState } from "@/design-system";
import { bookingsClient } from "@/features/bookings/api/bookings.client";
import { formatBookingPeriod } from "@/features/bookings/model/booking-labels";
import type { BookingFees } from "@/shared/contracts/bookings";
import { ApiClientError } from "@/shared/lib/api-client";
import { formatCents } from "@/shared/lib/format";
import { useToast } from "@/shared/toast/useToast";

/** One CSV cell: quoted, inner quotes doubled. */
const cell = (value: string) => `"${value.replace(/"/g, '""')}"`;

// The month's usage fees by unit: pick the ones sent to the condominium's
// billing (or undo it) and export the list as a spreadsheet (CSV).
export function FeesConsole({ fees }: { fees: BookingFees }) {
  const router = useRouter();
  const { showError, showSuccess } = useToast();
  const [selected, setSelected] = useState<ReadonlySet<string>>(new Set());
  const [pending, setPending] = useState<"bill" | "unbill" | null>(null);

  const chosen = fees.items.filter((item) => selected.has(item.id));
  const allSelected =
    fees.items.length > 0 && selected.size === fees.items.length;

  const byUnit = useMemo(() => {
    const totals = new Map<string, number>();
    for (const item of fees.items) {
      const unit = item.unitLabel ?? "Sem unidade";
      totals.set(unit, (totals.get(unit) ?? 0) + (item.feeCents ?? 0));
    }
    return totals;
  }, [fees.items]);

  function toggle(id: string) {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function mark(billed: boolean) {
    setPending(billed ? "bill" : "unbill");
    try {
      const { changed } = await bookingsClient.setFeesBilled(
        chosen.map((item) => item.id),
        billed,
      );
      showSuccess(
        billed
          ? `${changed} taxa${changed === 1 ? " marcada" : "s marcadas"} como lançada${changed === 1 ? "" : "s"}.`
          : `${changed} taxa${changed === 1 ? " voltou" : "s voltaram"} para pendente.`,
      );
      setSelected(new Set());
      router.refresh();
    } catch (cause) {
      showError(
        cause instanceof ApiClientError
          ? cause.message
          : "Não foi possível atualizar as taxas.",
      );
    }
    setPending(null);
  }

  function exportCsv() {
    const rows = [
      ["Unidade", "Morador", "Espaço", "Quando", "Valor (R$)", "Situação"],
      ...fees.items.map((item) => [
        item.unitLabel ?? "",
        item.userName,
        item.spaceName,
        formatBookingPeriod(item),
        ((item.feeCents ?? 0) / 100).toFixed(2).replace(".", ","),
        item.feeBilledAt ? "Lançada" : "Pendente",
      ]),
    ];
    // BOM so Excel opens the accents right; ";" as Brazilian Excel expects.
    const csv = `﻿${rows.map((row) => row.map(cell).join(";")).join("\r\n")}`;
    const link = document.createElement("a");
    link.href = URL.createObjectURL(
      new Blob([csv], { type: "text/csv;charset=utf-8" }),
    );
    link.download = `taxas-${fees.month}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  }

  if (fees.items.length === 0) {
    return (
      <Card>
        <EmptyState
          icon={<Wallet className="size-5" />}
          title="Nenhuma taxa neste mês"
          description="Reservas confirmadas de espaços pagos aparecem aqui, por unidade."
        />
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-muted">
          {selected.size > 0
            ? `${selected.size} selecionada${selected.size === 1 ? "" : "s"} · ${formatCents(chosen.reduce((sum, item) => sum + (item.feeCents ?? 0), 0))}`
            : `${fees.items.length} taxa${fees.items.length === 1 ? "" : "s"} de ${byUnit.size} unidade${byUnit.size === 1 ? "" : "s"}`}
        </p>
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            variant="secondary"
            icon={<Download className="size-4" />}
            onClick={exportCsv}
          >
            Exportar planilha
          </Button>
          <Button
            size="sm"
            variant="secondary"
            icon={<Undo2 className="size-4" />}
            disabled={chosen.length === 0 || pending !== null}
            loading={pending === "unbill"}
            onClick={() => mark(false)}
          >
            Voltar para pendente
          </Button>
          <Button
            size="sm"
            icon={<CircleCheck className="size-4" />}
            disabled={chosen.length === 0 || pending !== null}
            loading={pending === "bill"}
            onClick={() => mark(true)}
          >
            Marcar como lançadas
          </Button>
        </div>
      </div>

      <Card className="overflow-x-auto">
        <table className="w-full min-w-[40rem] text-sm">
          <thead className="border-b border-border text-left text-xs text-muted">
            <tr>
              <th className="w-10 px-4 py-2.5">
                <input
                  type="checkbox"
                  aria-label="Selecionar todas"
                  className="size-4 accent-[var(--brand)]"
                  checked={allSelected}
                  onChange={() =>
                    setSelected(
                      allSelected
                        ? new Set()
                        : new Set(fees.items.map((item) => item.id)),
                    )
                  }
                />
              </th>
              <th className="px-2 py-2.5 font-medium">Unidade</th>
              <th className="px-2 py-2.5 font-medium">Morador</th>
              <th className="px-2 py-2.5 font-medium">Espaço e quando</th>
              <th className="px-2 py-2.5 text-right font-medium">Valor</th>
              <th className="px-4 py-2.5 font-medium">Situação</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {fees.items.map((item) => (
              <tr
                key={item.id}
                className={
                  selected.has(item.id) ? "bg-surface-muted" : undefined
                }
              >
                <td className="px-4 py-2.5">
                  <input
                    type="checkbox"
                    aria-label={`Selecionar a taxa de ${item.userName}`}
                    className="size-4 accent-[var(--brand)]"
                    checked={selected.has(item.id)}
                    onChange={() => toggle(item.id)}
                  />
                </td>
                <td className="px-2 py-2.5 whitespace-nowrap text-fg">
                  {item.unitLabel ?? "—"}
                </td>
                <td className="px-2 py-2.5 text-fg">{item.userName}</td>
                <td className="px-2 py-2.5 text-muted">
                  <span className="text-fg">{item.spaceName}</span>
                  <span className="block text-xs capitalize">
                    {formatBookingPeriod(item)}
                  </span>
                </td>
                <td className="px-2 py-2.5 text-right whitespace-nowrap text-fg tabular-nums">
                  {formatCents(item.feeCents ?? 0)}
                </td>
                <td className="px-4 py-2.5">
                  {item.feeBilledAt ? (
                    <Badge tone="success">Lançada</Badge>
                  ) : (
                    <Badge tone="warning">Pendente</Badge>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
