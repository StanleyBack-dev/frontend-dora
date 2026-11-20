"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { MapPin, PackageCheck } from "lucide-react";
import {
  Alert,
  Button,
  Drawer,
  Field,
  FormSection,
  Select,
  Spinner,
} from "@/design-system";
import { parcelsClient } from "@/features/parcels/api/parcels.client";
import { ParcelDetails } from "@/features/parcels/components/ParcelDetails";
import {
  SignaturePad,
  type SignatureCapture,
} from "@/features/parcels/components/SignaturePad";
import { formatParcelCode } from "@/features/parcels/model/parcel-labels";
import {
  deviceTimeZone,
  LOCATION_LABELS,
  readDevice,
  readLocation,
} from "@/features/parcels/model/signature-evidence";
import type {
  Parcel,
  ParcelToHandOver,
  SignatureLocation,
} from "@/shared/contracts/parcels";
import { ApiClientError } from "@/shared/lib/api-client";
import {
  documentError,
  maskDocument,
  type DocumentType,
} from "@/shared/lib/identity-document";
import { useToast } from "@/shared/toast/useToast";

const FORM_ID = "parcel-pickup-form";

const errorMessage = (cause: unknown, fallback: string) =>
  cause instanceof ApiClientError ? cause.message : fallback;

// Hands a parcel over (gate or administration): found by the pickup code
// (the resident's QR, or typed), whoever takes it says their name (and a
// document, optional), reads the declaration and signs on the screen. The
// device's location is asked when the panel opens; the API adds its time,
// the IP and the browser and keeps it all as the signature's evidence.
export function ParcelPickupDrawer({
  code,
  onClose,
  onDone,
}: {
  /** The code to hand over (null: closed). */
  code: string | null;
  onClose: () => void;
  onDone: (parcel: Parcel) => void;
}) {
  const { showError, showSuccess } = useToast();
  const [parcel, setParcel] = useState<ParcelToHandOver | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [documentType, setDocumentType] = useState<DocumentType>("CPF");
  const [document, setDocument] = useState("");
  const [signature, setSignature] = useState<SignatureCapture | null>(null);
  const [location, setLocation] = useState<SignatureLocation | null>(null);
  const [sending, setSending] = useState(false);
  const locating = useRef<Promise<SignatureLocation> | null>(null);

  const open = code !== null;

  // Callers key the drawer by the code: each code starts from a blank
  // state, and this only loads it.
  useEffect(() => {
    if (!code) return;
    let cancelled = false;
    locating.current = readLocation().then((found) => {
      if (!cancelled) setLocation(found);
      return found;
    });
    parcelsClient
      .byCode(code)
      .then((found) => {
        if (cancelled) return;
        setParcel(found);
        setName(found.recipientName ?? "");
      })
      .catch((cause: unknown) => {
        if (!cancelled) {
          setLoadError(
            errorMessage(cause, "Não foi possível buscar o código."),
          );
        }
      });
    return () => {
      cancelled = true;
    };
  }, [code]);

  const signerName = name.trim().replace(/\s+/g, " ");
  const invalidDocument = document
    ? documentError(documentType, document)
    : null;
  const declaration = parcel?.pickupDeclaration ?? null;
  const ready =
    declaration !== null &&
    signerName.length >= 3 &&
    signature !== null &&
    !invalidDocument;

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!parcel || !declaration || !signature || !ready) return;
    setSending(true);
    try {
      const where = location ??
        (await locating.current) ?? { status: "UNAVAILABLE" as const };
      const done = await parcelsClient.pickUp({
        code: parcel.pickupCode,
        signerName,
        signerDocumentType: document ? documentType : null,
        signerDocument: document || null,
        declarationShown: declaration,
        signatureImage: signature.image,
        signatureDrawing: JSON.stringify(signature.drawing),
        clientSignedAt: new Date().toISOString(),
        clientTimeZone: deviceTimeZone(),
        location: where,
        device: readDevice(signature.pointerType),
      });
      showSuccess(
        "Encomenda entregue.",
        `Retirada por ${signerName}. Os moradores da unidade foram avisados.`,
      );
      onDone(done);
    } catch (cause) {
      showError(errorMessage(cause, "Não foi possível registrar a entrega."));
    } finally {
      setSending(false);
    }
  }

  return (
    <Drawer
      open={open}
      onClose={onClose}
      busy={sending}
      width="lg"
      title="Entregar encomenda"
      subtitle={code ? `Código ${formatParcelCode(code)}` : undefined}
      footer={
        declaration ? (
          <div className="flex justify-end gap-2">
            <Button variant="cancel" onClick={onClose} disabled={sending}>
              Cancelar
            </Button>
            <Button
              type="submit"
              form={FORM_ID}
              loading={sending}
              disabled={!ready}
              icon={<PackageCheck className="size-4" />}
            >
              Confirmar entrega
            </Button>
          </div>
        ) : undefined
      }
    >
      {loadError ? (
        <Alert tone="danger">{loadError}</Alert>
      ) : !parcel ? (
        <div className="flex justify-center py-10">
          <Spinner label="Buscando a encomenda…" />
        </div>
      ) : (
        <form id={FORM_ID} onSubmit={submit} className="space-y-6">
          <ParcelDetails parcel={parcel} />

          {!declaration ? (
            <Alert tone="warning">
              Esta encomenda não está mais aguardando retirada.
            </Alert>
          ) : (
            <>
              <FormSection title="Quem está retirando">
                <div className="grid gap-3 sm:grid-cols-[1fr_auto_1fr]">
                  <Field
                    label="Nome completo"
                    required
                    autoComplete="off"
                    maxLength={120}
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    data-autofocus
                  />
                  <Select
                    label="Documento"
                    value={documentType}
                    onChange={(event) => {
                      setDocumentType(event.target.value as DocumentType);
                      setDocument("");
                    }}
                    options={[
                      { value: "CPF", label: "CPF" },
                      { value: "RG", label: "RG" },
                    ]}
                  />
                  <Field
                    label="Número (opcional)"
                    inputMode={documentType === "CPF" ? "numeric" : "text"}
                    autoComplete="off"
                    value={document}
                    error={invalidDocument ?? undefined}
                    onChange={(event) =>
                      setDocument(
                        maskDocument(documentType, event.target.value),
                      )
                    }
                  />
                </div>
              </FormSection>

              <FormSection title="Declaração e assinatura">
                <blockquote className="rounded-xl border border-border bg-surface-muted p-4 text-sm leading-relaxed text-fg">
                  Eu, <strong>{signerName || "________"}</strong>, {declaration}
                </blockquote>
                <SignaturePad onChange={setSignature} disabled={sending} />
                <p className="flex items-center gap-1.5 text-xs text-soft">
                  <MapPin aria-hidden className="size-3.5" />
                  {location
                    ? LOCATION_LABELS[location.status]
                    : "Obtendo a localização do aparelho…"}
                  {" · "}A data, a hora, o IP e o aparelho também ficam
                  registrados como prova da assinatura.
                </p>
              </FormSection>
            </>
          )}
        </form>
      )}
    </Drawer>
  );
}
