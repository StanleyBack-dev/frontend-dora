"use client";

import { useState } from "react";
import { Mail, Paperclip, Plus, Send, Trash2 } from "lucide-react";
import { Button, Field, Modal, TextArea } from "@/design-system";
import {
  isEmail,
  MAX_SHARE_EMAILS,
  MAX_SHARE_MESSAGE,
} from "@/features/purchases/model/quote-share";
import { errorMessage } from "@/shared/lib/api-client";
import { useToast } from "@/shared/toast/useToast";

/**
 * Sends a purchase document (the comparison map, the purchase order) by
 * e-mail: who to (up to 5, maybe suggested) and the message, already written
 * (it can be changed). The API attaches the PDF and sends one e-mail per
 * address; replies go to whoever sent it.
 */
export function DocumentEmailModal({
  title,
  sentTitle,
  fileName,
  defaultEmails = [],
  defaultMessage,
  open,
  onClose,
  onSend,
}: {
  title: string;
  /** The toast once sent ("Mapa de cotação enviado."). */
  sentTitle: string;
  fileName: string;
  defaultEmails?: string[];
  defaultMessage: string;
  open: boolean;
  onClose: () => void;
  onSend: (input: { emails: string[]; message: string }) => Promise<{
    sent: number;
  }>;
}) {
  const firstEmails = defaultEmails.length ? defaultEmails : [""];
  const { showError, showSuccess } = useToast();
  const [emails, setEmails] = useState<string[]>(firstEmails);
  const [message, setMessage] = useState(defaultMessage);
  const [tried, setTried] = useState(false);
  const [sending, setSending] = useState(false);

  const typed = emails.map((email) => email.trim().toLowerCase());
  const list = typed.filter(Boolean);
  /** Each field's problem (empty extra fields are just ignored). */
  const fieldProblem = (index: number) => {
    const email = typed[index];
    if (!email) {
      return index === 0 && list.length === 0
        ? "Informe ao menos um e-mail."
        : undefined;
    }
    if (!isEmail(email)) return "E-mail inválido.";
    return typed.indexOf(email) < index
      ? "Este e-mail já está na lista."
      : undefined;
  };
  const emailsProblem = emails.some((_, index) => fieldProblem(index));
  const setEmail = (index: number, value: string) =>
    setEmails((current) =>
      current.map((email, at) => (at === index ? value : email)),
    );
  const removeEmail = (index: number) =>
    setEmails((current) =>
      current.length === 1 ? [""] : current.filter((_, at) => at !== index),
    );
  const messageProblem = message.trim() ? null : "Escreva a mensagem.";

  function close() {
    if (sending) return;
    setTried(false);
    onClose();
  }

  async function send() {
    setTried(true);
    if (emailsProblem || messageProblem) return;
    setSending(true);
    try {
      const { sent } = await onSend({ emails: list, message: message.trim() });
      showSuccess(
        sentTitle,
        sent === 1
          ? "1 e-mail com o PDF em anexo."
          : `${sent} e-mails com o PDF em anexo.`,
      );
      setEmails(firstEmails);
      setMessage(defaultMessage);
      setTried(false);
      onClose();
    } catch (cause) {
      showError(errorMessage(cause, "Não foi possível enviar o e-mail."));
    } finally {
      setSending(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={close}
      title={title}
      icon={<Mail className="size-4" />}
      busy={sending}
      footer={
        <>
          <Button variant="cancel" onClick={close} disabled={sending}>
            Cancelar
          </Button>
          <Button
            icon={<Send className="size-4" />}
            onClick={() => void send()}
            loading={sending}
          >
            Enviar
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <fieldset className="space-y-2">
          <legend className="mb-1.5 text-[13px] font-semibold text-fg">
            Para <span className="text-danger">*</span>
          </legend>
          {emails.map((email, index) => (
            <div key={index} className="flex items-start gap-2">
              <Field
                label={`E-mail ${index + 1}`}
                hideLabel
                type="email"
                inputMode="email"
                autoComplete="email"
                placeholder={
                  index === 0 ? "sindico@exemplo.com" : "outro@exemplo.com"
                }
                value={email}
                error={tried ? fieldProblem(index) : undefined}
                onChange={(event) => setEmail(index, event.target.value)}
                className="min-w-0 flex-1"
              />
              {emails.length > 1 && (
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={`Remover e-mail ${index + 1}`}
                  icon={<Trash2 className="size-4" />}
                  onClick={() => removeEmail(index)}
                />
              )}
            </div>
          ))}
          <div className="flex flex-wrap items-center justify-between gap-2">
            {emails.length < MAX_SHARE_EMAILS ? (
              <Button
                variant="secondary"
                size="sm"
                icon={<Plus className="size-4" />}
                onClick={() => setEmails((current) => [...current, ""])}
              >
                Adicionar e-mail
              </Button>
            ) : (
              <span />
            )}
            <span className="text-xs text-muted">
              {emails.length} de {MAX_SHARE_EMAILS} · cada pessoa recebe o seu
              e-mail
            </span>
          </div>
        </fieldset>
        <TextArea
          label="Mensagem"
          required
          rows={8}
          maxLength={MAX_SHARE_MESSAGE}
          value={message}
          hint={`${message.length}/${MAX_SHARE_MESSAGE} caracteres. Pode mudar o texto à vontade.`}
          error={tried && messageProblem ? messageProblem : undefined}
          onChange={(event) => setMessage(event.target.value)}
        />
        <p className="flex items-center gap-2 rounded-xl bg-brand-soft px-3 py-2 text-[13px] text-brand-ink">
          <Paperclip aria-hidden className="size-4 shrink-0" />
          <span className="min-w-0 break-words">
            Vai em anexo: <strong>{fileName}</strong>
          </span>
        </p>
      </div>
    </Modal>
  );
}
