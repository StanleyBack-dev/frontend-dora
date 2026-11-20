import { MapPin, ShieldAlert, ShieldCheck } from "lucide-react";
import { Alert, Card } from "@/design-system";
import { COLLECTED_BY_ROLE_LABELS } from "@/features/parcels/model/parcel-labels";
import { LOCATION_LABELS } from "@/features/parcels/model/signature-evidence";
import type { ParcelReceipt } from "@/shared/contracts/parcels";
import { formatDateTime } from "@/shared/lib/datetime";

/** The device facts worth reading, from the stored JSON. */
function deviceFacts(json: string): string | null {
  try {
    const device = JSON.parse(json) as Record<string, unknown>;
    const parts = [
      typeof device.platform === "string" ? device.platform : null,
      typeof device.pointerType === "string"
        ? `assinado com ${POINTER_LABELS[device.pointerType] ?? device.pointerType}`
        : null,
      typeof device.screenWidth === "number" &&
      typeof device.screenHeight === "number"
        ? `tela ${device.screenWidth}×${device.screenHeight}`
        : null,
      typeof device.language === "string" ? device.language : null,
    ].filter(Boolean);
    return parts.length > 0 ? parts.join(" · ") : null;
  } catch {
    return null;
  }
}

const POINTER_LABELS: Record<string, string> = {
  touch: "o dedo",
  pen: "caneta",
  mouse: "mouse",
};

// The pickup receipt: who signed, the declaration and the signature as
// drawn on the screen, and the evidence recorded with it (times, IP,
// device, location, who handed it over) with its SHA-256 digest. "Íntegro"
// means the stored evidence still matches the digest written at signing.
export function ParcelReceiptView({ receipt }: { receipt: ParcelReceipt }) {
  const location =
    receipt.locationStatus === "GRANTED" &&
    receipt.latitude !== null &&
    receipt.longitude !== null
      ? {
          text: `${receipt.latitude.toFixed(5)}, ${receipt.longitude.toFixed(5)}${receipt.locationAccuracyMeters !== null ? ` (± ${Math.round(receipt.locationAccuracyMeters)} m)` : ""}`,
          href: `https://www.google.com/maps?q=${receipt.latitude},${receipt.longitude}`,
        }
      : null;
  const evidence = [
    {
      label: "Assinado em (servidor)",
      value: formatDateTime(receipt.signedAt),
    },
    {
      label: "Hora do aparelho",
      value: receipt.clientSignedAt
        ? `${formatDateTime(receipt.clientSignedAt)}${receipt.clientTimeZone ? ` (${receipt.clientTimeZone})` : ""}`
        : null,
    },
    {
      label: "Entregue por",
      value: `${receipt.collectedByName} · ${COLLECTED_BY_ROLE_LABELS[receipt.collectedByRole] ?? receipt.collectedByRole}`,
    },
    { label: "Endereço IP", value: receipt.ipAddress },
    { label: "Aparelho", value: deviceFacts(receipt.device) },
    { label: "Navegador", value: receipt.userAgent },
  ].filter((fact) => fact.value);

  return (
    <Card className="space-y-5 p-4 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-fg">Comprovante de retirada</h2>
          <p className="text-[13px] text-muted">
            Assinatura eletrônica feita na tela de quem entregou.
          </p>
        </div>
        {receipt.intact ? (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-success-border bg-success-soft px-3 py-1 text-[13px] font-semibold text-success">
            <ShieldCheck aria-hidden className="size-4" />
            Registro íntegro
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-danger-border bg-danger-soft px-3 py-1 text-[13px] font-semibold text-danger">
            <ShieldAlert aria-hidden className="size-4" />
            Registro alterado
          </span>
        )}
      </div>

      {!receipt.intact && (
        <Alert tone="danger">
          As provas guardadas não conferem mais com o código gravado na
          assinatura. Procure a administração do condomínio.
        </Alert>
      )}

      <div className="grid gap-5 lg:grid-cols-2">
        <div className="space-y-3">
          <div>
            <p className="text-xs text-soft">Quem retirou</p>
            <p className="font-semibold text-fg">
              {receipt.signerName}
              {receipt.signerDocumentMasked && (
                <span className="font-normal text-muted">
                  {" "}
                  · {receipt.signerDocumentType} {receipt.signerDocumentMasked}
                </span>
              )}
            </p>
          </div>
          <blockquote className="rounded-xl border border-border bg-surface-muted p-3 text-[13px] leading-relaxed text-fg">
            {receipt.declaration}
          </blockquote>
        </div>
        <figure className="space-y-1.5">
          {/* eslint-disable-next-line @next/next/no-img-element -- short-lived signed link */}
          <img
            src={receipt.imageUrl}
            alt={`Assinatura de ${receipt.signerName}`}
            className="h-40 w-full rounded-xl border border-border bg-white object-contain p-2"
          />
          <figcaption className="text-center text-xs text-soft">
            Assinatura como foi desenhada
          </figcaption>
        </figure>
      </div>

      <dl className="grid gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
        {evidence.map((fact) => (
          <div key={fact.label} className="min-w-0">
            <dt className="text-xs text-soft">{fact.label}</dt>
            <dd className="break-words text-fg">{fact.value}</dd>
          </div>
        ))}
        <div className="min-w-0">
          <dt className="text-xs text-soft">Localização</dt>
          <dd className="break-words text-fg">
            {location ? (
              <a
                href={location.href}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-brand-ink hover:underline"
              >
                <MapPin aria-hidden className="size-3.5" />
                {location.text}
              </a>
            ) : (
              LOCATION_LABELS[receipt.locationStatus]
            )}
          </dd>
        </div>
      </dl>

      <details className="rounded-xl border border-border px-3 py-2">
        <summary className="cursor-pointer text-[13px] font-medium text-muted">
          Códigos de verificação (SHA-256)
        </summary>
        <dl className="mt-2 space-y-2 font-mono text-[11px] break-all text-muted">
          <div>
            <dt className="font-sans text-xs text-soft">Todas as provas</dt>
            <dd>{receipt.evidenceSha256}</dd>
          </div>
          <div>
            <dt className="font-sans text-xs text-soft">
              Imagem da assinatura
            </dt>
            <dd>{receipt.imageSha256}</dd>
          </div>
          <div>
            <dt className="font-sans text-xs text-soft">
              Traços da assinatura
            </dt>
            <dd>{receipt.strokesSha256}</dd>
          </div>
        </dl>
      </details>
    </Card>
  );
}
