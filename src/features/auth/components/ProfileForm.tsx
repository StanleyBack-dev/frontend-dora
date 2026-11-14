"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Copy, Save } from "lucide-react";
import { Button, Field } from "@/design-system";
import { authClient } from "@/features/auth/api/auth.client";
import { ApiClientError } from "@/shared/lib/api-client";
import { formatPhone, maskPhone, phoneError } from "@/shared/lib/masks";
import { useToast } from "@/shared/toast/useToast";

// Read-only account data (login and group): changed only by the
// administration, but easy to copy.
function LockedField({ label, value }: { label: string; value: string }) {
  const { showError, showSuccess } = useToast();

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      showSuccess(`${label} copiado.`);
    } catch {
      showError(`Não foi possível copiar o ${label.toLowerCase()}.`);
    }
  }

  return (
    <Field
      label={label}
      value={value}
      readOnly
      className="[&_input]:bg-surface-muted [&_input]:text-muted"
      trailing={
        <button
          type="button"
          onClick={copy}
          aria-label={`Copiar ${label.toLowerCase()}`}
          title="Copiar"
          className="grid size-8 place-items-center rounded-md text-soft transition-colors hover:bg-surface hover:text-fg"
        >
          <Copy className="size-4" />
        </button>
      }
    />
  );
}

export function ProfileForm({
  initialName,
  initialEmail,
  initialPhone,
  username,
  groupLabel,
}: {
  initialName: string;
  initialEmail: string;
  /** Stored digits (null: none). */
  initialPhone: string | null;
  username: string;
  groupLabel: string;
}) {
  const router = useRouter();
  const [name, setName] = useState(initialName);
  const [email, setEmail] = useState(initialEmail);
  const startPhone = initialPhone ? formatPhone(initialPhone) : "";
  const [phone, setPhone] = useState(startPhone);
  const invalidPhone = phone ? phoneError(phone) : null;
  const { showError, showSuccess } = useToast();
  const [pending, setPending] = useState(false);

  const changed =
    name.trim() !== initialName ||
    email.trim() !== initialEmail ||
    phone !== startPhone;

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (invalidPhone) return showError(invalidPhone);
    setPending(true);
    try {
      await authClient.updateProfile({ name, email, phone });
      showSuccess("Dados atualizados.");
      router.refresh();
    } catch (cause) {
      showError(
        cause instanceof ApiClientError
          ? cause.message
          : "Não foi possível salvar.",
      );
    }
    setPending(false);
  }

  return (
    <form onSubmit={submit} className="space-y-4" noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <LockedField label="Usuário" value={username} />
        <LockedField label="Grupo" value={groupLabel} />
      </div>
      <Field
        label="Nome completo"
        autoComplete="name"
        required
        value={name}
        onChange={(event) => setName(event.target.value)}
      />
      <Field
        label="E-mail"
        type="email"
        autoComplete="email"
        required
        value={email}
        onChange={(event) => setEmail(event.target.value)}
      />
      <Field
        label="Telefone (WhatsApp)"
        type="tel"
        inputMode="tel"
        autoComplete="tel-national"
        placeholder="(62) 99999-0000"
        value={phone}
        onChange={(event) => setPhone(maskPhone(event.target.value))}
        error={invalidPhone ?? undefined}
      />
      <Button
        type="submit"
        loading={pending}
        disabled={!changed}
        icon={<Save className="size-4" />}
      >
        Salvar
      </Button>
    </form>
  );
}
