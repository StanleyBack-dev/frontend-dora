"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Clock, LifeBuoy, Send } from "lucide-react";
import { Button, DraftNotice, Field, Select, TextArea } from "@/design-system";
import { supportClient } from "@/features/support/api/support.client";
import {
  SUPPORT_CATEGORIES,
  SUPPORT_CATEGORY_LABELS,
  protocolLabel,
} from "@/features/support/model/support-labels";
import type { SupportCategory, SupportQuota } from "@/shared/contracts/support";
import { ApiClientError } from "@/shared/lib/api-client";
import { sameShape } from "@/shared/lib/form-draft";
import { useFormDraft } from "@/shared/lib/use-form-draft";
import { useToast } from "@/shared/toast/useToast";

const MESSAGE_MAX = 2000;

/** "03:12:45". */
function formatRemaining(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${pad(Math.floor(total / 3600))}:${pad(Math.floor((total % 3600) / 60))}:${pad(total % 60)}`;
}

type SupportDraft = {
  category: SupportCategory;
  subject: string;
  message: string;
};

const EMPTY_SUPPORT: SupportDraft = {
  category: "DUVIDA",
  subject: "",
  message: "",
};

// "Falar com o suporte": category, subject and message, up to
// three a day. With the day's requests used, a countdown to the next day
// replaces the button (the API checks the limit again).
export function SupportRequestForm({ quota }: { quota: SupportQuota }) {
  const router = useRouter();
  const { showError, showSuccess } = useToast();
  // A draft until sent (also while the day's limit is used up).
  const draft = useFormDraft<SupportDraft>(
    "support-request",
    EMPTY_SUPPORT,
    (raw) => sameShape(EMPTY_SUPPORT, raw),
    { restoreOnMount: true },
  );
  const { category, subject, message } = draft.value;
  const setField =
    <K extends keyof SupportDraft>(key: K) =>
    (value: SupportDraft[K]) =>
      draft.set((current) => ({ ...current, [key]: value }));
  const setCategory = setField("category");
  const setSubject = setField("subject");
  const setMessage = setField("message");
  const [pending, setPending] = useState(false);
  const blocked = quota.remaining === 0;
  const valid = subject.trim().length >= 3 && message.trim().length >= 10;

  async function submit() {
    setPending(true);
    try {
      const sent = await supportClient.send({ category, subject, message });
      showSuccess(
        `Solicitação ${protocolLabel(sent.protocol)} enviada.`,
        "O suporte foi avisado e a resposta chega aqui e no seu e-mail.",
      );
      draft.discard();
      router.refresh();
    } catch (cause) {
      showError(
        cause instanceof ApiClientError
          ? cause.message
          : "Não foi possível enviar a solicitação.",
      );
    }
    setPending(false);
  }

  return (
    <form
      className="space-y-4"
      onSubmit={(event) => {
        event.preventDefault();
        if (valid && !blocked) void submit();
      }}
    >
      <div className="flex items-start gap-3 rounded-lg border border-brand-border bg-brand-soft px-4 py-3">
        <LifeBuoy
          aria-hidden
          className="mt-0.5 size-4 shrink-0 text-brand-ink"
        />
        <p className="text-[13px] text-fg">
          A administração do sistema recebe a sua solicitação no app e por
          e-mail. Você pode enviar até <strong>{quota.limit} por dia</strong>
          {blocked ? (
            "."
          ) : (
            <>
              {" "}
              — restam <strong>{quota.remaining} hoje</strong>.
            </>
          )}
        </p>
      </div>

      {draft.restored && <DraftNotice onDiscard={draft.discard} />}

      {blocked && quota.nextAllowedAt && (
        <Cooldown until={quota.nextAllowedAt} onEnd={() => router.refresh()} />
      )}

      <div className="grid gap-4 sm:grid-cols-[minmax(0,14rem)_minmax(0,1fr)]">
        <Select
          label="Categoria"
          required
          value={category}
          disabled={blocked || pending}
          onChange={(event) =>
            setCategory(event.target.value as SupportCategory)
          }
          options={SUPPORT_CATEGORIES.map((value) => ({
            value,
            label: SUPPORT_CATEGORY_LABELS[value],
          }))}
        />
        <Field
          label="Assunto"
          required
          maxLength={120}
          placeholder="Ex.: Não consigo entrar no app"
          value={subject}
          disabled={blocked || pending}
          onChange={(event) => setSubject(event.target.value)}
        />
      </div>
      <div>
        <TextArea
          label="Mensagem"
          required
          rows={6}
          maxLength={MESSAGE_MAX}
          placeholder="Conte o que aconteceu, em qual tela e o que você esperava. Quanto mais detalhes, mais rápido conseguimos ajudar."
          value={message}
          disabled={blocked || pending}
          onChange={(event) => setMessage(event.target.value)}
        />
        <p className="mt-1 text-right text-xs text-soft tabular-nums">
          {message.length}/{MESSAGE_MAX}
        </p>
      </div>
      <div className="flex justify-end">
        <Button
          type="submit"
          icon={<Send className="size-4" />}
          loading={pending}
          disabled={!valid || blocked}
          className="max-sm:w-full max-sm:justify-center"
        >
          Enviar solicitação
        </Button>
      </div>
    </form>
  );
}

// Time left until the next day, when new requests are possible.
function Cooldown({ until, onEnd }: { until: string; onEnd: () => void }) {
  const target = new Date(until).getTime();
  const [left, setLeft] = useState(() => target - Date.now());

  useEffect(() => {
    const timer = window.setInterval(() => {
      const next = target - Date.now();
      setLeft(next);
      if (next <= 0) {
        window.clearInterval(timer);
        onEnd();
      }
    }, 1000);
    return () => window.clearInterval(timer);
  }, [target, onEnd]);

  if (left <= 0) return null;
  return (
    <div className="flex items-center gap-3 rounded-lg border border-border bg-surface-muted px-4 py-3">
      <Clock aria-hidden className="size-4 shrink-0 text-brand-ink" />
      <p className="text-[13px] text-fg">
        Você já enviou as solicitações de hoje. Novas estarão disponíveis em{" "}
        <strong className="tabular-nums">{formatRemaining(left)}</strong>.
      </p>
    </div>
  );
}
