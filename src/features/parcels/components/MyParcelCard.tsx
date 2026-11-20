import Link from "next/link";
import { ChevronRight, Lock, Package } from "lucide-react";
import { Badge, Card } from "@/design-system";
import { InviteCode } from "@/features/bookings/components/InviteCode";
import {
  formatParcelCode,
  PARCEL_STATUS_LABELS,
  PARCEL_STATUS_TONES,
  parcelOutcome,
  parcelSummary,
} from "@/features/parcels/model/parcel-labels";
import type { Parcel } from "@/shared/contracts/parcels";
import { formatDateTime } from "@/shared/lib/datetime";

// A parcel of the resident's unit. While it waits: the QR and the pickup
// code to show whoever hands it over (gate or administration). Afterwards:
// how it ended, and the receipt of the pickup with the signature.
export function MyParcelCard({
  parcel,
  qrSvg,
}: {
  parcel: Parcel;
  /** SVG of the pickup code (only while it waits). */
  qrSvg: string | null;
}) {
  const waiting = parcel.status === "RECEIVED";
  const facts = [
    { label: "Unidade", value: parcel.unitLabel },
    { label: "Destinatário", value: parcel.recipientName },
    { label: "Transportadora", value: parcel.carrier },
    { label: "Rastreio", value: parcel.trackingCode },
    { label: "Chegou em", value: formatDateTime(parcel.receivedAt) },
    { label: "Observação", value: parcel.notes },
  ].filter((fact) => fact.value);

  return (
    <Card className="flex flex-col gap-4 p-4 sm:p-5">
      <div className="flex items-start gap-3">
        {parcel.photoUrl ? (
          <a
            href={parcel.photoUrl}
            target="_blank"
            rel="noreferrer"
            className="shrink-0"
            aria-label="Abrir a foto da encomenda"
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- short-lived signed link */}
            <img
              src={parcel.photoUrl}
              alt={`Foto da encomenda ${parcelSummary(parcel)}`}
              className="size-16 rounded-xl border border-border object-cover"
            />
          </a>
        ) : (
          <span className="grid size-16 shrink-0 place-items-center rounded-xl border border-dashed border-border text-soft">
            <Package aria-hidden className="size-6" />
          </span>
        )}
        <div className="min-w-0 flex-1 space-y-1.5">
          <p className="leading-snug font-semibold break-words text-fg">
            {parcelSummary(parcel)}
          </p>
          <div className="flex flex-wrap items-center gap-1.5">
            <Badge tone={PARCEL_STATUS_TONES[parcel.status]}>
              {PARCEL_STATUS_LABELS[parcel.status]}
            </Badge>
            {parcel.recipientOnly && (
              <Badge tone="info">
                <Lock aria-hidden className="mr-1 size-3" />
                Só para você
              </Badge>
            )}
          </div>
        </div>
      </div>

      {waiting && qrSvg && (
        <div className="space-y-2">
          <InviteCode
            code={parcel.pickupCode}
            qrSvg={qrSvg}
            label="Código de retirada"
            qrLabel={`QR code da encomenda ${formatParcelCode(parcel.pickupCode)}`}
          />
          <p className="text-center text-[13px] text-muted">
            Mostre o QR (ou diga o código) na portaria ou na administração e
            assine na tela de quem entregar.
          </p>
        </div>
      )}

      <dl className="grid gap-x-4 gap-y-2 text-sm sm:grid-cols-2">
        {facts.map((fact) => (
          <div key={fact.label} className="min-w-0">
            <dt className="text-xs text-soft">{fact.label}</dt>
            <dd className="break-words text-fg">{fact.value}</dd>
          </div>
        ))}
      </dl>

      {!waiting && (
        <div className="flex flex-col gap-2 border-t border-border pt-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[13px] text-muted">{parcelOutcome(parcel)}</p>
          {parcel.status === "PICKED_UP" && (
            <Link
              href={`/encomendas/${parcel.id}`}
              className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-brand-ink hover:underline"
            >
              Ver comprovante
              <ChevronRight aria-hidden className="size-4" />
            </Link>
          )}
        </div>
      )}
    </Card>
  );
}
