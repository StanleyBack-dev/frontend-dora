"use client";

import Link from "next/link";
import { FileCheck2, Package, Snowflake, Undo2, XCircle } from "lucide-react";
import {
  Badge,
  Button,
  buttonClasses,
  cn,
  DataTable,
  EmptyState,
  type DataTableColumn,
} from "@/design-system";
import {
  PARCEL_STATUS_LABELS,
  PARCEL_STATUS_TONES,
  parcelOutcome,
  parcelSummary,
  perishableNote,
} from "@/features/parcels/model/parcel-labels";
import type { Parcel } from "@/shared/contracts/parcels";
import { formatDateTime } from "@/shared/lib/datetime";

/** What happened to a parcel that left: picked up, returned, cancelled. */
// The condominium's parcels for the gate and the administration. The
// pickup code is not listed: whoever picks up shows it (the QR, or typed).
// A waiting parcel can be returned or cancelled from here.
export function ParcelsTable({
  parcels,
  filtered,
  now,
  onReturn,
  onCancel,
}: {
  parcels: Parcel[];
  filtered: boolean;
  /** This request's time (perishable deadlines). */
  now: number;
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
      render: (parcel) => {
        const perishable = perishableNote(parcel, now);
        return (
          <span className="flex flex-col items-start gap-1">
            <Badge tone={PARCEL_STATUS_TONES[parcel.status]}>
              {PARCEL_STATUS_LABELS[parcel.status]}
            </Badge>
            {perishable && parcel.status === "RECEIVED" && (
              <Badge tone={perishable.overdue ? "danger" : "info"}>
                <Snowflake aria-hidden className="mr-1 size-3" />
                {perishable.overdue
                  ? "Prazo vencido"
                  : `Até ${perishable.when}`}
              </Badge>
            )}
          </span>
        );
      },
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
      render: (parcel) =>
        parcelOutcome(parcel) ?? "Ainda na guarda do condomínio",
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
        ) : parcel.status === "PICKED_UP" ? (
          <Link
            href={`/encomendas/${parcel.id}`}
            className={buttonClasses("ghost", "sm")}
          >
            <FileCheck2 aria-hidden className="mr-1.5 size-4" />
            Comprovante
          </Link>
        ) : null,
    },
  ];

  return (
    <DataTable
      rows={parcels}
      columns={columns}
      getId={(parcel) => parcel.id}
      renderExpanded={(parcel) =>
        parcel.status === "PICKED_UP" ? (
          <div className="border-t border-border bg-surface-muted/40 p-3">
            <Link
              href={`/encomendas/${parcel.id}`}
              className={cn(buttonClasses("secondary", "sm"), "w-full")}
            >
              <FileCheck2 aria-hidden className="mr-1.5 size-4" />
              Ver comprovante
            </Link>
          </div>
        ) : (
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
        )
      }
    />
  );
}
