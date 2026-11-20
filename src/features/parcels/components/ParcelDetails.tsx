import { Package } from "lucide-react";
import { Badge } from "@/design-system";
import {
  formatParcelCode,
  PARCEL_STATUS_LABELS,
  PARCEL_STATUS_TONES,
  parcelSummary,
} from "@/features/parcels/model/parcel-labels";
import type { Parcel } from "@/shared/contracts/parcels";
import { formatDateTime } from "@/shared/lib/datetime";

// A parcel at a glance: its photo, the unit, who it is for and where it is
// kept, so whoever hands it over finds the right package.
export function ParcelDetails({
  parcel,
  showCode = true,
}: {
  parcel: Parcel;
  /** The pickup code (hidden from the desk's list of waiting parcels). */
  showCode?: boolean;
}) {
  const facts = [
    { label: "Unidade", value: parcel.unitLabel ?? "Unidade removida" },
    {
      label: "Destinatário",
      value: parcel.recipientOnly
        ? `${parcel.recipientName ?? "Morador escolhido"} (só para este morador)`
        : parcel.recipientName,
    },
    { label: "Transportadora", value: parcel.carrier },
    { label: "Rastreio", value: parcel.trackingCode },
    { label: "Onde está", value: parcel.storageLocation },
    {
      label: "Recebida",
      value: `${formatDateTime(parcel.receivedAt)}${parcel.receivedByName ? ` por ${parcel.receivedByName}` : ""}`,
    },
    { label: "Observação", value: parcel.notes },
  ].filter((fact) => fact.value);

  return (
    <div className="flex flex-col gap-4 sm:flex-row">
      {parcel.photoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element -- short-lived signed link
        <img
          src={parcel.photoUrl}
          alt={`Foto da encomenda ${parcelSummary(parcel)}`}
          className="h-40 w-full rounded-xl border border-border object-cover sm:w-40"
        />
      ) : (
        <div className="flex h-24 w-full items-center justify-center rounded-xl border border-dashed border-border text-soft sm:h-40 sm:w-40">
          <Package aria-hidden className="size-8" />
        </div>
      )}
      <div className="min-w-0 flex-1 space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          {showCode && (
            <span className="font-mono text-lg font-semibold tracking-wider text-fg">
              {formatParcelCode(parcel.pickupCode)}
            </span>
          )}
          <Badge tone={PARCEL_STATUS_TONES[parcel.status]}>
            {PARCEL_STATUS_LABELS[parcel.status]}
          </Badge>
        </div>
        <dl className="grid gap-x-4 gap-y-2 text-sm sm:grid-cols-2">
          {facts.map((fact) => (
            <div key={fact.label} className="min-w-0">
              <dt className="text-xs text-soft">{fact.label}</dt>
              <dd className="break-words text-fg">{fact.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}
