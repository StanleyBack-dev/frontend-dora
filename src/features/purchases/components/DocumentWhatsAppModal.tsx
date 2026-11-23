"use client";

import { useEffect, useState } from "react";
import { MessageCircle, Paperclip } from "lucide-react";
import { Alert, Button, Modal, Spinner, TextArea } from "@/design-system";
import { MAX_SHARE_MESSAGE } from "@/features/purchases/model/quote-share";
import { errorMessage, apiDownload } from "@/shared/lib/api-client";
import { saveFile } from "@/shared/lib/save-file";
import { useToast } from "@/shared/toast/useToast";

type Prepared =
  | { state: "loading" }
  | { state: "ready"; file: File; canShareFile: boolean }
  | { state: "failed"; message: string };

/** The device's share sheet takes the PDF (phones, some computers). */
function sharesFiles(file: File) {
  return (
    typeof navigator !== "undefined" &&
    typeof navigator.canShare === "function" &&
    navigator.canShare({ files: [file] })
  );
}

/** "5562999990000" from a Brazilian phone as typed (null: none). */
function whatsAppNumber(phone: string | null | undefined): string | null {
  const digits = phone?.replace(/\D/g, "") ?? "";
  if (digits.length === 10 || digits.length === 11) return `55${digits}`;
  return digits.length >= 12 ? digits : null;
}

/**
 * Shares a document (the quote map, the purchase order) on WhatsApp with
 * the message. The PDF is built when the dialog opens, so the tap on
 * "Compartilhar" can hand it straight to the device's share sheet,
 * attached (WhatsApp links can't carry files). Where there is no share
 * sheet for files (most computers), the PDF is downloaded and WhatsApp Web
 * opens with the message (in the chat with `phone`, when given), to attach
 * it there.
 */
export function DocumentWhatsAppModal({
  path,
  fileName,
  defaultMessage,
  phone,
  open,
  onClose,
}: {
  /** The BFF path of the PDF. */
  path: string;
  fileName: string;
  defaultMessage: string;
  /** Whom to write to (e.g. the supplier); else WhatsApp asks. */
  phone?: string | null;
  open: boolean;
  onClose: () => void;
}) {
  const { showError, showSuccess } = useToast();
  const [message, setMessage] = useState(defaultMessage);
  const [prepared, setPrepared] = useState<Prepared>({ state: "loading" });

  useEffect(() => {
    if (!open) return;
    let active = true;
    apiDownload(path)
      .then(({ blob, fileName: name }) => {
        if (!active) return;
        const file = new File([blob], name ?? fileName, {
          type: "application/pdf",
        });
        setPrepared({ state: "ready", file, canShareFile: sharesFiles(file) });
      })
      .catch((cause: unknown) => {
        if (!active) return;
        setPrepared({
          state: "failed",
          message: errorMessage(cause, "Não foi possível gerar o PDF."),
        });
      });
    return () => {
      active = false;
    };
  }, [open, path, fileName]);

  async function share() {
    if (prepared.state !== "ready") return;
    const text = message.trim();
    if (prepared.canShareFile) {
      try {
        await navigator.share({ files: [prepared.file], text });
        onClose();
      } catch (cause) {
        // Closing the share sheet is not an error.
        if (!(cause instanceof DOMException && cause.name === "AbortError")) {
          showError("Não foi possível abrir o compartilhamento.");
        }
      }
      return;
    }
    saveFile(prepared.file, prepared.file.name);
    window.open(
      `https://wa.me/${whatsAppNumber(phone) ?? ""}?text=${encodeURIComponent(text)}`,
      "_blank",
      "noopener,noreferrer",
    );
    showSuccess(
      "PDF baixado e WhatsApp aberto.",
      "Na conversa, anexe o arquivo baixado (clipe › Documento).",
      8000,
    );
    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Compartilhar no WhatsApp"
      icon={<MessageCircle className="size-4" />}
      footer={
        <>
          <Button variant="cancel" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            icon={<MessageCircle className="size-4" />}
            onClick={() => void share()}
            disabled={prepared.state !== "ready" || !message.trim()}
          >
            {prepared.state === "ready" && !prepared.canShareFile
              ? "Baixar PDF e abrir WhatsApp"
              : "Compartilhar"}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <TextArea
          label="Mensagem"
          rows={6}
          maxLength={MAX_SHARE_MESSAGE}
          value={message}
          hint="Pode mudar o texto à vontade."
          onChange={(event) => setMessage(event.target.value)}
        />
        {prepared.state === "loading" && (
          <p className="flex items-center gap-2 text-[13px] text-muted">
            <Spinner size="sm" /> Gerando o PDF…
          </p>
        )}
        {prepared.state === "failed" && (
          <Alert tone="danger">{prepared.message}</Alert>
        )}
        {prepared.state === "ready" && (
          <p className="flex items-start gap-2 rounded-xl bg-brand-soft px-3 py-2 text-[13px] text-brand-ink">
            <Paperclip aria-hidden className="mt-0.5 size-4 shrink-0" />
            <span className="min-w-0 break-words">
              {prepared.canShareFile ? (
                <>
                  Vai em anexo: <strong>{prepared.file.name}</strong>. Escolha o
                  WhatsApp e a conversa na próxima tela.
                </>
              ) : (
                <>
                  Neste aparelho o WhatsApp não recebe o anexo direto: o PDF{" "}
                  <strong>{prepared.file.name}</strong> será baixado e o
                  WhatsApp Web abre com a mensagem, para você anexar.
                </>
              )}
            </span>
          </p>
        )}
      </div>
    </Modal>
  );
}
