"use client";

import { Package, Undo2, XCircle } from "lucide-react";
import {
  Badge,
  Button,
  DataTable,
  EmptyState,
  type DataTableColumn,
} from "@/design-system";
import {
  PARCEL_STATUS_LABELS,
  PARCEL_STATUS_TONES,
  parcelSummary,
} from "@/features/parcels/model/parcel-labels";
import type { Parcel } from "@/shared/contracts/parcels";
import { formatDateTime } from "@/shared/lib/datetime";

/** What happened to a parcel that left: picked up, returned, cancelled. */
function outcome(parcel: Parcel): string | null {
  if (!parcel.closedAt) return null;
  const when = formatDateTime(parcel.closedAt);
  if (parcel.status === "PICKED_UP") {
    return `Retirada por ${parcel.signerName ?? "—"} em ${when}${parcel.closedByName ? ` (entregue por ${parcel.closedByName})` : ""}`;
  }
  return `${PARCEL_STATUS_LABELS[parcel.status]} em ${when}${parcel.closeReason ? `: ${parcel.closeReason}` : ""}`;
}

// The condominium's parcels for the gate and the administration. The
// pickup code is not listed: whoever picks up shows it (the QR, or typed).
// A waiting parcel can be returned or cancelled from here.
export function ParcelsTable({
  parcels,
  filtered,
  onReturn,
  onCancel,
}: {
  parcels: Parcel[];
  filtered: boolean;
  onReturn: (parcel: Parcel) => void;
  onCancel: (parcel: Parcel) => void;
}) {
  if (parcels.length === 0) {
    return (
      <EmptyState
        icon={<Package className="size-5" />}
        title={filtered ? "Nenhuma encomenda encontrada" : "Nenhuma encomenda"}
        description={
          filtered
            ? "Tente outra busca, unidade ou situação, ou limpe os filtros."
            : "As encomendas recebidas aparecem aqui."
        }
      />
    );
  }

  const columns: DataTableColumn<Parcel>[] = [
    {
      key: "unit",
      label: "Unidade",
      mobile: "title",
      render: (parcel) => (
        <span className="font-medium text-fg">
          {parcel.unitLabel ?? "Unidade removida"}
        </span>
      ),
    },
    {
      key: "what",
      label: "Encomenda",
      mobile: "subtitle",
      render: (parcel) => (
        <span className="flex min-w-0 flex-col">
          <span className="truncate text-fg">{parcelSummary(parcel)}</span>
          {parcel.storageLocation && (
            <span className="truncate text-xs text-soft">
              {parcel.storageLocation}
            </span>
          )}
        </span>
      ),
    },
    {
      key: "received",
      label: "Recebida",
      render: (parcel) => (
        <span className="flex flex-col">
          <span>{formatDateTime(parcel.receivedAt)}</span>
          {parcel.receivedByName && (
            <span className="text-xs text-soft">
              por {parcel.receivedByName}
            </span>
          )}
        </span>
      ),
    },
    {
      key: "status",
      label: "Situação",
      render: (parcel) => (
        <Badge tone={PARCEL_STATUS_TONES[parcel.status]}>
          {PARCEL_STATUS_LABELS[parcel.status]}
        </Badge>
      ),
    },
    {
      key: "tracking",
      label: "Rastreio",
      desktop: "detail",
      render: (parcel) => parcel.trackingCode ?? "—",
    },
    {
      key: "notes",
      label: "Observação",
      desktop: "detail",
      render: (parcel) => parcel.notes ?? "—",
    },
    {
      key: "photo",
      label: "Foto",
      desktop: "detail",
      render: (parcel) =>
        parcel.photoUrl ? (
          <a
            href={parcel.photoUrl}
            target="_blank"
            rel="noreferrer"
            className="text-brand underline-offset-2 hover:underline"
          >
            Ver foto
          </a>
        ) : (
          "Sem foto"
        ),
    },
    {
      key: "outcome",
      label: "Saída",
      desktop: "detail",
      render: (parcel) => outcome(parcel) ?? "Ainda na guarda do condomínio",
    },
    {
      key: "actions",
      label: "",
      className: "text-right",
      // Phones: a bar at the end of the open card (renderExpanded).
      mobile: "hidden",
      render: (parcel) =>
        parcel.status === "RECEIVED" ? (
          <span className="flex justify-end gap-1">
            <Button
              size="sm"
              variant="ghost"
              icon={<Undo2 className="size-4" />}
              onClick={() => onReturn(parcel)}
            >
              Devolver
            </Button>
            <Button
              size="sm"
              variant="ghost"
              icon={<XCircle className="size-4" />}
              onClick={() => onCancel(parcel)}
            >
              Cancelar
            </Button>
          </span>
        ) : null,
    },
  ];

  return (
    <DataTable
      rows={parcels}
      columns={columns}
      getId={(parcel) => parcel.id}
      renderExpanded={(parcel) =>
        parcel.status === "RECEIVED" && (
          <div className="grid grid-cols-2 gap-2 border-t border-border bg-surface-muted/40 p-3">
            <Button
              size="sm"
              variant="secondary"
              className="w-full justify-center"
              icon={<Undo2 className="size-4" />}
              onClick={() => onReturn(parcel)}
            >
              Devolver
            </Button>
            <Button
              size="sm"
              variant="danger"
              className="w-full justify-center"
              icon={<XCircle className="size-4" />}
              onClick={() => onCancel(parcel)}
            >
              Cancelar
            </Button>
          </div>
        )
      }
    />
  );
}
