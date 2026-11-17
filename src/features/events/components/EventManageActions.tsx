"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Ban, Pencil, Send } from "lucide-react";
import { Button, buttonClasses, cn, Modal, TextArea } from "@/design-system";
import { eventsClient } from "@/features/events/api/events.client";
import type { CondominiumEvent } from "@/shared/contracts/events";
import { ApiClientError } from "@/shared/lib/api-client";
import { useToast } from "@/shared/toast/useToast";

// A manager's actions on an open event: edit, publish (draft) and cancel
// (with a reason; residents are told if it was published).
export function EventManageActions({ event }: { event: CondominiumEvent }) {
  const router = useRouter();
  const { showError, showSuccess } = useToast();
  const [confirming, setConfirming] = useState<"publish" | "cancel" | null>(
    null,
  );
  const [reason, setReason] = useState("");
  const [pending, setPending] = useState(false);
  const draft = event.status === "DRAFT";

  const fail = (cause: unknown, fallback: string) =>
    showError(cause instanceof ApiClientError ? cause.message : fallback);

  async function publish() {
    setPending(true);
    try {
      await eventsClient.publish(event.id);
      showSuccess(
        "Evento publicado.",
        "Os moradores foram avisados no app e por e-mail.",
      );
      setConfirming(null);
      router.refresh();
    } catch (cause) {
      fail(cause, "Não foi possível publicar.");
    }
    setPending(false);
  }

  async function cancel() {
    setPending(true);
    try {
      await eventsClient.cancel(event.id, reason);
      showSuccess(
        "Evento cancelado.",
        draft ? undefined : "Os moradores foram avisados.",
      );
      setConfirming(null);
      router.refresh();
    } catch (cause) {
      fail(cause, "Não foi possível cancelar.");
    }
    setPending(false);
  }

  return (
    <>
      <div className="flex flex-wrap gap-2">
        <Link
          href={`/gestao/eventos/${event.id}/editar`}
          className={cn(buttonClasses("secondary"), "gap-2")}
        >
          <Pencil aria-hidden className="size-4" />
          Editar
        </Link>
        {draft && (
          <Button
            icon={<Send className="size-4" />}
            onClick={() => setConfirming("publish")}
          >
            Publicar
          </Button>
        )}
        <Button
          variant="ghost"
          icon={<Ban className="size-4" />}
          onClick={() => {
            setReason("");
            setConfirming("cancel");
          }}
        >
          Cancelar evento
        </Button>
      </div>

      <Modal
        open={confirming === "publish"}
        onClose={() => setConfirming(null)}
        title="Publicar o evento?"
        busy={pending}
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => setConfirming(null)}
              disabled={pending}
            >
              Voltar
            </Button>
            <Button onClick={publish} loading={pending}>
              Publicar e avisar
            </Button>
          </>
        }
      >
        <p>
          Todos do condomínio passam a ver <strong>{event.title}</strong> e
          recebem um aviso no app e por e-mail, com o convite para a agenda do
          celular.
        </p>
      </Modal>

      <Modal
        open={confirming === "cancel"}
        onClose={() => setConfirming(null)}
        title="Cancelar o evento?"
        tone="danger"
        busy={pending}
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => setConfirming(null)}
              disabled={pending}
            >
              Voltar
            </Button>
            <Button
              variant="danger"
              onClick={cancel}
              loading={pending}
              disabled={reason.trim().length < 3}
            >
              Cancelar evento
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <p>
            {draft
              ? "O rascunho é encerrado e não pode mais ser publicado."
              : "Os moradores são avisados com o motivo, e o evento sai da agenda do celular. Não dá para desfazer."}
          </p>
          <TextArea
            label="Motivo"
            required
            rows={2}
            maxLength={400}
            placeholder="Ex.: previsão de chuva forte"
            value={reason}
            onChange={(change) => setReason(change.target.value)}
          />
        </div>
      </Modal>
    </>
  );
}
