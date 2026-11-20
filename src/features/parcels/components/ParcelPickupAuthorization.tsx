"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Send, UserCheck, UserPlus, X } from "lucide-react";
import { Button, Field, Modal, Select } from "@/design-system";
import { parcelsClient } from "@/features/parcels/api/parcels.client";
import { formatParcelCode } from "@/features/parcels/model/parcel-labels";
import type { Parcel } from "@/shared/contracts/parcels";
import { ApiClientError } from "@/shared/lib/api-client";
import {
  documentError,
  maskDocument,
  type DocumentType,
} from "@/shared/lib/identity-document";
import { useToast } from "@/shared/toast/useToast";

const message = (cause: unknown, fallback: string) =>
  cause instanceof ApiClientError ? cause.message : fallback;

// Someone else picks up a waiting parcel: the resident names one person
// (name and, optionally, CPF or RG), can change or remove it, and sends
// them the pickup code. The desk sees the authorization when the code is
// read; the others who see the parcel are told.
export function ParcelPickupAuthorization({ parcel }: { parcel: Parcel }) {
  const router = useRouter();
  const { showError, showSuccess } = useToast();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [documentType, setDocumentType] = useState<DocumentType>("CPF");
  const [document, setDocument] = useState("");
  const [sending, setSending] = useState(false);
  const [removing, setRemoving] = useState(false);
  const invalidDocument = document
    ? documentError(documentType, document)
    : null;
  const valid = name.trim().length >= 3 && !invalidDocument;

  function start() {
    setName("");
    setDocumentType("CPF");
    setDocument("");
    setOpen(true);
  }

  async function save() {
    if (!valid) return;
    setSending(true);
    try {
      await parcelsClient.authorize(parcel.id, {
        name: name.trim(),
        documentType: document ? documentType : null,
        document: document || null,
      });
      showSuccess(
        "Retirada autorizada",
        "Envie o código para a pessoa: ela mostra na portaria e assina na tela.",
      );
      setOpen(false);
      router.refresh();
    } catch (cause) {
      showError(message(cause, "Não foi possível autorizar."));
    } finally {
      setSending(false);
    }
  }

  async function remove() {
    setRemoving(true);
    try {
      await parcelsClient.revokeAuthorization(parcel.id);
      showSuccess("Autorização removida");
      router.refresh();
    } catch (cause) {
      showError(message(cause, "Não foi possível remover."));
    } finally {
      setRemoving(false);
    }
  }

  // The phone's share sheet (WhatsApp…), or the clipboard elsewhere.
  async function sendCode() {
    const text = `Código de retirada da encomenda: ${formatParcelCode(parcel.pickupCode)}. Mostre este código na portaria ou na administração do condomínio e assine na tela para retirar.`;
    try {
      if (navigator.share) {
        await navigator.share({ title: "Código de retirada", text });
        return;
      }
      await navigator.clipboard.writeText(text);
      showSuccess("Código copiado", "Cole na conversa com quem vai retirar.");
    } catch (cause) {
      // Closing the share sheet is not an error.
      if (cause instanceof DOMException && cause.name === "AbortError") return;
      showError("Não foi possível enviar o código.");
    }
  }

  return (
    <div className="space-y-3 rounded-xl border border-border bg-surface-muted/40 p-3 sm:p-4">
      {parcel.authorizedName ? (
        <div className="flex items-start gap-2">
          <UserCheck
            aria-hidden
            className="mt-0.5 size-4 shrink-0 text-success"
          />
          <p className="min-w-0 flex-1 text-sm text-fg">
            <span className="font-semibold">{parcel.authorizedName}</span>
            {parcel.authorizedDocumentMasked
              ? ` · ${parcel.authorizedDocumentMasked}`
              : ""}{" "}
            pode retirar
            {parcel.authorizedByName ? (
              <span className="text-muted">
                {" "}
                (autorizado por {parcel.authorizedByName})
              </span>
            ) : null}
            .
          </p>
        </div>
      ) : (
        <p className="text-center text-[13px] text-muted">
          Não vai retirar? Autorize outra pessoa e envie o código para ela.
        </p>
      )}
      {/* Centred, full width on phones: the brand orange for the main
          action, black to send the code, the red outline to remove. */}
      {parcel.authorizedName ? (
        <div className="mx-auto grid max-w-md grid-cols-1 gap-2 sm:grid-cols-3">
          <Button
            variant="primary"
            className="w-full justify-center"
            icon={<Send className="size-4" />}
            onClick={() => void sendCode()}
          >
            Enviar o código
          </Button>
          <Button
            variant="brand"
            className="w-full justify-center"
            icon={<UserPlus className="size-4" />}
            onClick={start}
          >
            Trocar pessoa
          </Button>
          <Button
            variant="cancel"
            className="w-full justify-center"
            loading={removing}
            icon={<X className="size-4" />}
            onClick={() => void remove()}
          >
            Remover
          </Button>
        </div>
      ) : (
        <div className="flex justify-center">
          <Button
            variant="brand"
            className="w-full justify-center sm:w-auto"
            icon={<UserPlus className="size-4" />}
            onClick={start}
          >
            Autorizar outra pessoa
          </Button>
        </div>
      )}

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        busy={sending}
        icon={<UserPlus className="size-5" />}
        title="Autorizar outra pessoa a retirar"
        footer={
          <>
            <Button
              variant="cancel"
              onClick={() => setOpen(false)}
              disabled={sending}
            >
              Voltar
            </Button>
            <Button
              loading={sending}
              disabled={!valid}
              onClick={() => void save()}
            >
              Autorizar
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <p className="text-sm text-muted">
            A portaria vê o nome (e o documento) quando ler o código. Quem
            retira assina na tela, e os outros moradores que veem esta encomenda
            são avisados.
          </p>
          <Field
            label="Nome completo"
            required
            maxLength={120}
            autoComplete="off"
            value={name}
            onChange={(event) => setName(event.target.value)}
            data-autofocus
          />
          <div className="grid gap-3 sm:grid-cols-[auto_1fr]">
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
        </div>
      </Modal>
    </div>
  );
}
