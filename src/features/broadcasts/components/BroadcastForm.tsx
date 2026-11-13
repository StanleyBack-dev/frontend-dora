"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Megaphone, Send } from "lucide-react";
import { Alert, Button, Field, Modal, Select, TextArea } from "@/design-system";
import { GROUP_LABELS } from "@/features/access/model/access-labels";
import { broadcastsClient } from "@/features/broadcasts/api/broadcasts.client";
import {
  AUDIENCES,
  AUDIENCE_LABELS,
} from "@/features/broadcasts/model/broadcast-labels";
import type { UserGroup } from "@/shared/contracts/api";
import type { BroadcastAudience } from "@/shared/contracts/broadcasts";
import { ApiClientError } from "@/shared/lib/api-client";
import { useToast } from "@/shared/toast/useToast";

/** Roles inside the condominium that can receive an announcement. */
const ROLES: UserGroup[] = ["USER", "ADMIN"];

/** "Moradores", "Gestores"…: how a group reads as recipients. */
const GROUP_AUDIENCE: Record<UserGroup, string> = {
  USER: "os moradores",
  ADMIN: "os gestores",
  ADMIN_MASTER: "os administradores gerais",
};

// New announcement: who receives it, the message, and whether it also goes
// by e-mail. Sending can't be undone, so it asks for confirmation.
export function BroadcastForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [audience, setAudience] = useState<BroadcastAudience>("TODOS");
  const [targetGroup, setTargetGroup] = useState<UserGroup | "">("");
  const [sendEmail, setSendEmail] = useState(true);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const { showError } = useToast();
  const [sent, setSent] = useState<string | null>(null);

  const target =
    audience === "GRUPO"
      ? targetGroup
        ? GROUP_AUDIENCE[targetGroup]
        : null
      : "todos do condomínio";
  const valid =
    title.trim().length >= 3 && body.trim().length >= 3 && target !== null;

  async function send() {
    setPending(true);
    try {
      const result = await broadcastsClient.send({
        title: title.trim(),
        body: body.trim(),
        audience,
        targetGroup: audience === "GRUPO" ? (targetGroup as UserGroup) : null,
        sendEmail,
      });
      setSent(
        `Comunicado enviado para ${result.recipients} pessoa${result.recipients === 1 ? "" : "s"}.`,
      );
      setTitle("");
      setBody("");
      router.refresh();
    } catch (cause) {
      showError(
        cause instanceof ApiClientError
          ? cause.message
          : "Não foi possível enviar.",
      );
    }
    setConfirmOpen(false);
    setPending(false);
  }

  return (
    <div className="space-y-4">
      {sent && <Alert tone="success">{sent}</Alert>}
      <div className="grid gap-4 sm:grid-cols-2">
        <Select
          label="Para"
          required
          value={audience}
          options={AUDIENCES.map((value) => ({
            value,
            label: AUDIENCE_LABELS[value],
          }))}
          onChange={(e) => setAudience(e.target.value as BroadcastAudience)}
        />
        {audience === "GRUPO" && (
          <Select
            label="Papel"
            required
            placeholder="Escolha"
            value={targetGroup}
            options={ROLES.map((value) => ({
              value,
              label: GROUP_LABELS[value],
            }))}
            onChange={(e) => setTargetGroup(e.target.value as UserGroup | "")}
          />
        )}
      </div>
      <Field
        label="Título"
        required
        maxLength={120}
        value={title}
        onChange={(e) => {
          setSent(null);
          setTitle(e.target.value);
        }}
      />
      <TextArea
        label="Mensagem"
        required
        rows={5}
        maxLength={2000}
        value={body}
        onChange={(e) => {
          setSent(null);
          setBody(e.target.value);
        }}
      />
      <label className="flex items-center gap-2 text-sm text-fg">
        <input
          type="checkbox"
          className="size-4 accent-[var(--brand)]"
          checked={sendEmail}
          onChange={(e) => setSendEmail(e.target.checked)}
        />
        Também enviar por e-mail
      </label>
      <Button
        variant="brand"
        icon={<Send className="size-4" />}
        disabled={!valid}
        onClick={() => setConfirmOpen(true)}
      >
        Enviar comunicado
      </Button>

      <Modal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Enviar comunicado"
        icon={<Megaphone className="size-5" />}
        busy={pending}
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => setConfirmOpen(false)}
              disabled={pending}
            >
              Voltar
            </Button>
            <Button onClick={send} loading={pending}>
              Enviar
            </Button>
          </>
        }
      >
        &ldquo;{title.trim()}&rdquo; vai para {target} no app
        {sendEmail ? ", por e-mail" : ""} e nos aparelhos com notificação
        ativada. Depois de enviado, não dá para desfazer.
      </Modal>
    </div>
  );
}
