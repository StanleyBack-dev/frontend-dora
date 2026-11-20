"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  BellRing,
  Building2,
  Mail,
  Megaphone,
  Send,
  ShieldCheck,
  UserRound,
  Users,
  UsersRound,
} from "lucide-react";
import {
  Alert,
  Button,
  ChoiceCards,
  CollapsibleSection,
  DraftNotice,
  Field,
  Modal,
  TextArea,
  type ChoiceOption,
} from "@/design-system";
import { GROUP_LABELS } from "@/features/access/model/access-labels";
import { broadcastsClient } from "@/features/broadcasts/api/broadcasts.client";
import { AUDIENCE_LABELS } from "@/features/broadcasts/model/broadcast-labels";
import type { UserGroup } from "@/shared/contracts/api";
import type { BroadcastAudience } from "@/shared/contracts/broadcasts";
import { ApiClientError } from "@/shared/lib/api-client";
import { sameShape } from "@/shared/lib/form-draft";
import { useFormDraft } from "@/shared/lib/use-form-draft";
import { useToast } from "@/shared/toast/useToast";

const AUDIENCE_OPTIONS: ChoiceOption<BroadcastAudience>[] = [
  {
    value: "TODOS",
    title: AUDIENCE_LABELS.TODOS,
    hint: "Moradores, gestores e portaria.",
    icon: <Building2 />,
  },
  {
    value: "GRUPO",
    title: AUDIENCE_LABELS.GRUPO,
    hint: "Só moradores, só gestores ou só a portaria.",
    icon: <UsersRound />,
  },
];

/** Roles inside the condominium that can receive an announcement. */
const GROUP_OPTIONS: ChoiceOption<UserGroup>[] = [
  { value: "USER", title: GROUP_LABELS.USER, icon: <UserRound /> },
  { value: "ADMIN", title: GROUP_LABELS.ADMIN, icon: <ShieldCheck /> },
  { value: "CONCIERGE", title: GROUP_LABELS.CONCIERGE, icon: <Users /> },
];

const EMAIL_OPTIONS: ChoiceOption<"no" | "yes">[] = [
  {
    value: "no",
    title: "Só no app",
    hint: "Aviso no app e nos aparelhos com notificação.",
    icon: <BellRing />,
  },
  {
    value: "yes",
    title: "App e e-mail",
    hint: "Também no e-mail de cada pessoa.",
    icon: <Mail />,
  },
];

/** "Moradores", "Gestores"…: how a group reads as recipients. */
const GROUP_AUDIENCE: Record<UserGroup, string> = {
  USER: "os moradores",
  ADMIN: "os gestores",
  CONCIERGE: "a portaria",
  ADMIN_MASTER: "os administradores gerais",
};

type BroadcastDraft = {
  title: string;
  body: string;
  audience: BroadcastAudience;
  targetGroup: UserGroup | "";
  sendEmail: boolean;
};

const EMPTY_BROADCAST: BroadcastDraft = {
  title: "",
  body: "",
  audience: "TODOS",
  targetGroup: "",
  sendEmail: true,
};

// New announcement: who receives it, the message, and whether it also goes
// by e-mail. Sending can't be undone, so it asks for confirmation.
export function BroadcastForm() {
  const router = useRouter();
  // A draft until sent: leaving the page or a reload keeps the message.
  const draft = useFormDraft<BroadcastDraft>(
    "broadcast",
    EMPTY_BROADCAST,
    (raw) => sameShape(EMPTY_BROADCAST, raw),
    { restoreOnMount: true },
  );
  const { title, body, audience, targetGroup, sendEmail } = draft.value;
  const setField =
    <K extends keyof BroadcastDraft>(key: K) =>
    (value: BroadcastDraft[K]) =>
      draft.set((current) => ({ ...current, [key]: value }));
  const setTitle = setField("title");
  const setBody = setField("body");
  const setAudience = setField("audience");
  const setTargetGroup = setField("targetGroup");
  const setSendEmail = setField("sendEmail");
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
      draft.discard();
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
      {draft.restored && <DraftNotice onDiscard={draft.discard} />}
      <CollapsibleSection
        icon={<Users />}
        title="Para quem"
        description="Todo o condomínio ou só um grupo de acesso."
      >
        <ChoiceCards
          name="audience"
          options={AUDIENCE_OPTIONS}
          value={audience}
          onChange={setAudience}
        />
        {audience === "GRUPO" && (
          <ChoiceCards
            name="targetGroup"
            legend="Grupo"
            options={GROUP_OPTIONS}
            value={targetGroup}
            onChange={setTargetGroup}
          />
        )}
      </CollapsibleSection>
      <CollapsibleSection
        icon={<Megaphone />}
        title="Mensagem"
        description="O título aparece na notificação; a mensagem, ao abrir."
      >
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
      </CollapsibleSection>
      <CollapsibleSection
        icon={<Mail />}
        title="Como enviar"
        description="Sempre no app e nos aparelhos com notificação ativada."
      >
        <ChoiceCards
          name="sendEmail"
          options={EMAIL_OPTIONS}
          value={sendEmail ? "yes" : "no"}
          onChange={(value) => setSendEmail(value === "yes")}
        />
      </CollapsibleSection>
      <div className="flex justify-end">
        <Button
          variant="brand"
          icon={<Send className="size-4" />}
          disabled={!valid}
          onClick={() => setConfirmOpen(true)}
        >
          Enviar comunicado
        </Button>
      </div>

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
