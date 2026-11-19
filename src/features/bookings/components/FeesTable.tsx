"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CircleCheck, Download, Undo2, Wallet } from "lucide-react";
import {
  Badge,
  Button,
  DataTable,
  EmptyState,
  buttonClasses,
  type DataTableColumn,
} from "@/design-system";
import { bookingsClient } from "@/features/bookings/api/bookings.client";
import { formatBookingPeriod } from "@/features/bookings/model/booking-labels";
import type { Booking } from "@/shared/contracts/bookings";
import { ApiClientError } from "@/shared/lib/api-client";
import { formatCents } from "@/shared/lib/format";
import { useToast } from "@/shared/toast/useToast";

const CHECKBOX = "size-4 shrink-0 accent-[var(--brand)]";

// A page of a month's usage fees, as the API filtered them: pick the ones
// sent to the condominium's billing (or undo it; each button acts only on
// the selected fees it applies to, and says how many) and export every fee of
// the filter as a spreadsheet. On phones each fee is a card (checkbox, who
// and the value) whose details start with the full date and time.
export function FeesTable({
  fees,
  filtered,
  exportHref,
}: {
  fees: Booking[];
  /** Some filter is on (the empty state says so). */
  filtered: boolean;
  /** The spreadsheet of every fee of the month and filter. */
  exportHref: string;
}) {
  const router = useRouter();
  const { showError, showSuccess } = useToast();
  const [selected, setSelected] = useState<ReadonlySet<string>>(new Set());
  const [pending, setPending] = useState<"bill" | "unbill" | null>(null);

  const chosen = fees.filter((item) => selected.has(item.id));
  const allSelected = fees.length > 0 && chosen.length === fees.length;
  // Each action only applies to the selected fees in the other state: a
  // billed fee is never billed again (it keeps its original date).
  const toBill = chosen.filter((item) => !item.feeBilledAt);
  const toUnbill = chosen.filter((item) => item.feeBilledAt);
  const withCount = (label: string, count: number) =>
    count > 0 ? `${label} (${count})` : label;

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
        (billed ? toBill : toUnbill).map((item) => item.id),
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

  const columns: DataTableColumn<Booking>[] = [
    {
      key: "select",
      label: "Selecionar",
      mobile: "control",
      className: "w-10",
      render: (item) => (
        <input
          type="checkbox"
          aria-label={`Selecionar a taxa de ${item.userName}`}
          className={CHECKBOX}
          checked={selected.has(item.id)}
          onChange={() => toggle(item.id)}
        />
      ),
    },
    {
      key: "who",
      label: "Unidade e morador",
      mobile: "title",
      render: (item) => (
        <span className="flex min-w-0 flex-col">
          <span className="truncate font-medium text-fg">
            {item.unitLabel ?? "Sem unidade"}
          </span>
          <span className="truncate text-xs text-soft">{item.userName}</span>
        </span>
      ),
      renderMobile: (item) => (
        <span className="block truncate text-sm font-semibold text-fg">
          {item.unitLabel ? `${item.unitLabel} · ` : ""}
          {item.userName}
        </span>
      ),
    },
    {
      key: "where",
      label: "Espaço e quando",
      mobile: "subtitle",
      render: (item) => (
        <span className="flex min-w-0 flex-col">
          <span className="truncate text-fg">{item.spaceName}</span>
          <span className="truncate text-xs text-soft first-letter:uppercase">
            {formatBookingPeriod(item)}
          </span>
        </span>
      ),
      renderMobile: (item) => (
        <span className="flex items-center gap-2 text-xs text-muted">
          <span className="font-semibold text-fg tabular-nums">
            {formatCents(item.feeCents ?? 0)}
          </span>
          <FeeBadge item={item} />
        </span>
      ),
    },
    {
      key: "value",
      label: "Valor",
      mobile: "hidden",
      className: "whitespace-nowrap text-right tabular-nums",
      render: (item) => formatCents(item.feeCents ?? 0),
    },
    {
      key: "status",
      label: "Situação",
      mobile: "hidden",
      className: "whitespace-nowrap",
      render: (item) => <FeeBadge item={item} />,
    },
    // Phones only: under the chevron, starting with the full date and time.
    {
      key: "when",
      label: "Quando",
      desktop: "hidden",
      render: (item) => (
        <span className="block first-letter:uppercase">
          {formatBookingPeriod(item)}
        </span>
      ),
    },
    {
      key: "space",
      label: "Espaço",
      desktop: "hidden",
      render: (item) => item.spaceName,
    },
  ];

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3 sm:px-5">
        <label className="flex items-center gap-2 text-sm text-muted">
          <input
            type="checkbox"
            className={CHECKBOX}
            checked={allSelected}
            disabled={fees.length === 0}
            onChange={() =>
              setSelected(
                allSelected ? new Set() : new Set(fees.map((item) => item.id)),
              )
            }
          />
          {chosen.length > 0
            ? `${chosen.length} selecionada${chosen.length === 1 ? "" : "s"} · ${formatCents(chosen.reduce((sum, item) => sum + (item.feeCents ?? 0), 0))}`
            : "Selecionar todas desta página"}
        </label>
        <div className="grid w-full grid-cols-1 gap-2 sm:flex sm:w-auto sm:flex-wrap">
          <a
            href={exportHref}
            download
            className={buttonClasses("secondary", "sm")}
          >
            <Download aria-hidden className="size-4" />
            Exportar planilha
          </a>
          <Button
            size="sm"
            variant="secondary"
            icon={<Undo2 className="size-4" />}
            disabled={toUnbill.length === 0 || pending !== null}
            loading={pending === "unbill"}
            onClick={() => mark(false)}
          >
            {withCount("Voltar para pendente", toUnbill.length)}
          </Button>
          <Button
            size="sm"
            icon={<CircleCheck className="size-4" />}
            disabled={toBill.length === 0 || pending !== null}
            loading={pending === "bill"}
            onClick={() => mark(true)}
          >
            {withCount("Marcar como lançadas", toBill.length)}
          </Button>
        </div>
      </div>

      {fees.length === 0 ? (
        <EmptyState
          icon={<Wallet className="size-5" />}
          title={
            filtered ? "Nenhuma taxa encontrada" : "Nenhuma taxa neste mês"
          }
          description={
            filtered
              ? "Tente outros filtros."
              : "Reservas confirmadas de espaços pagos aparecem aqui, por unidade."
          }
        />
      ) : (
        <DataTable rows={fees} columns={columns} getId={(item) => item.id} />
      )}
    </>
  );
}

// Whether the fee was sent to the condominium's billing.
function FeeBadge({ item }: { item: Booking }) {
  return item.feeBilledAt ? (
    <Badge tone="success">Lançada</Badge>
  ) : (
    <Badge tone="warning">Pendente</Badge>
  );
}
