"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import {
  MapPin,
  PackageCheck,
  ShieldQuestion,
  UserCheck,
  UserRound,
} from "lucide-react";
import {
  Alert,
  Button,
  ChoiceCards,
  Drawer,
  Field,
  FormSection,
  Select,
  DrawerActions,
} from "@/design-system";
import { lostAndFoundClient } from "@/features/lost-and-found/api/lost-and-found.client";
import {
  SignaturePad,
  type SignatureCapture,
} from "@/features/signature/components/SignaturePad";
import {
  deviceTimeZone,
  LOCATION_LABELS,
  readDevice,
  readLocation,
} from "@/features/signature/model/signature-evidence";
import type {
  FoundItem,
  FoundItemDetails,
} from "@/shared/contracts/lost-and-found";
import type { SignatureLocation } from "@/shared/contracts/signature";
import { ApiClientError } from "@/shared/lib/api-client";
import {
  documentError,
  maskDocument,
  type DocumentType,
} from "@/shared/lib/identity-document";
import { useToast } from "@/shared/toast/useToast";

const FORM_ID = "found-item-return-form";
/** The "someone else" choice (no claim). */
const OTHER = "other";

// Hands a found item back (gate or administration): to a resident whose
// claim was accepted, or to someone else the desk recognised as the owner.
// Whoever takes it says their name (and a document, optional), reads the
// declaration and signs on the screen; the device's location is asked when
// the panel opens, and the API keeps it all as the signature's evidence.
// Callers mount it per opening (key), so each one starts blank.
export function FoundItemReturnDrawer({
  item,
  viewerId,
  open,
  claimId,
  onClose,
  onDone,
}: {
  item: FoundItemDetails;
  /** Who hands it over: their own claim is left to a colleague. */
  viewerId: string;
  open: boolean;
  /** The accepted claim to start from (null: someone else). */
  claimId: string | null;
  onClose: () => void;
  onDone: (item: FoundItem) => void;
}) {
  const { showError, showSuccess } = useToast();
  // The open claims (accepted or pending) of others: the return answers one.
  const accepted = item.claims.filter(
    (claim) =>
      (claim.status === "ACCEPTED" || claim.status === "PENDING") &&
      // Their own claim only when nobody else on the team could hand it over.
      (claim.userId !== viewerId || item.soleStaffMember),
  );
  const initial = accepted.find((claim) => claim.id === claimId) ?? null;
  const [choice, setChoice] = useState<string>(initial?.id ?? OTHER);
  const [name, setName] = useState(initial?.userName ?? "");
  const [documentType, setDocumentType] = useState<DocumentType>("CPF");
  const [document, setDocument] = useState("");
  const [signature, setSignature] = useState<SignatureCapture | null>(null);
  const [location, setLocation] = useState<SignatureLocation | null>(null);
  const [sending, setSending] = useState(false);
  const locating = useRef<Promise<SignatureLocation> | null>(null);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    locating.current = readLocation().then((found) => {
      if (!cancelled) setLocation(found);
      return found;
    });
    return () => {
      cancelled = true;
    };
  }, [open]);

  function choose(next: string) {
    if (next === choice) return;
    setChoice(next);
    const claim = accepted.find((candidate) => candidate.id === next);
    setName(claim?.userName ?? "");
    setDocument("");
  }

  const declaration = item.returnDeclaration;
  const signerName = name.trim().replace(/\s+/g, " ");
  const invalidDocument = document
    ? documentError(documentType, document)
    : null;
  const ready =
    declaration !== null &&
    signerName.length >= 3 &&
    signature !== null &&
    !invalidDocument;

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!declaration || !signature || !ready) return;
    setSending(true);
    try {
      const where = location ??
        (await locating.current) ?? { status: "UNAVAILABLE" as const };
      const claim = accepted.find((candidate) => candidate.id === choice);
      const done = await lostAndFoundClient.returnItem(item.id, {
        claimId: claim?.id ?? null,
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
        "Item devolvido.",
        claim
          ? `Retirado por ${signerName}. ${claim.userName} recebeu o comprovante.`
          : `Retirado por ${signerName}.`,
      );
      onDone(done);
    } catch (cause) {
      showError(
        cause instanceof ApiClientError
          ? cause.message
          : "Não foi possível registrar a devolução.",
      );
    } finally {
      setSending(false);
    }
  }

  const others = item.claims.filter(
    (claim) =>
      (claim.status === "PENDING" || claim.status === "ACCEPTED") &&
      claim.id !== choice,
  ).length;

  return (
    <Drawer
      open={open}
      onClose={onClose}
      busy={sending}
      width="lg"
      title="Devolver item"
      subtitle={item.title}
      footer={
        declaration ? (
          <DrawerActions>
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
              Confirmar devolução
            </Button>
          </DrawerActions>
        ) : undefined
      }
    >
      {!declaration ? (
        <Alert tone="warning">Este item não está mais guardado.</Alert>
      ) : (
        <form id={FORM_ID} onSubmit={submit} className="space-y-6">
          <div className="rounded-xl border border-warning-border bg-warning-soft p-3">
            <p className="flex items-center gap-1.5 text-sm font-semibold text-fg">
              <ShieldQuestion aria-hidden className="size-4" />
              Confira antes de entregar
            </p>
            <p className="mt-1 text-[13px] text-fg">
              {item.privateDetails
                ? `Pergunte o que só o dono saberia e compare: ${item.privateDetails}`
                : "Peça para a pessoa descrever o item (cor, marca, o que tem dentro) e confira um documento."}
            </p>
          </div>

          <FormSection title="Quem está retirando">
            {accepted.length > 0 && (
              <ChoiceCards<string>
                name="found-item-return-who"
                legend="Quem está retirando"
                value={choice}
                onChange={choose}
                options={[
                  ...accepted.map((claim) => ({
                    value: claim.id,
                    title: claim.userName,
                    hint: `${claim.status === "ACCEPTED" ? "Pedido aceito" : "Pediu o item"}${claim.unitLabel ? ` · ${claim.unitLabel}` : ""}`,
                    icon: <UserCheck />,
                  })),
                  {
                    value: OTHER,
                    title: "Outra pessoa",
                    hint: "Alguém que comprovou ser o dono",
                    icon: <UserRound />,
                  },
                ]}
              />
            )}
            {others > 0 && (
              <Alert tone="info">
                {others === 1
                  ? "O outro pedido aberto deste item será recusado e o morador, avisado."
                  : `Os outros ${others} pedidos abertos deste item serão recusados e os moradores, avisados.`}
              </Alert>
            )}
            <p className="text-xs text-muted">
              {choice === OTHER
                ? "Digite o nome de quem está retirando e confira um documento."
                : "Já vem com o nome de quem pediu. Se outra pessoa vier retirar (um familiar, por exemplo), troque o nome."}
            </p>
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
                  setDocument(maskDocument(documentType, event.target.value))
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
              {" · "}A data, a hora, o IP e o aparelho também ficam registrados
              como prova da assinatura.
            </p>
          </FormSection>
        </form>
      )}
    </Drawer>
  );
}
