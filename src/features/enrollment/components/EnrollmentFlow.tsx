"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { Camera, CheckCircle2, KeyRound, Send } from "lucide-react";
import { Button, Field, FormSection } from "@/design-system";
import { enrollmentClient } from "@/features/enrollment/api/enrollment.client";
import { EnrollmentFields } from "@/features/enrollment/components/EnrollmentFields";
import {
  ProfilePhotoField,
  type ProfilePhoto,
} from "@/features/enrollment/components/ProfilePhotoField";
import {
  EMPTY_ENROLLMENT,
  enrollmentErrors,
  toEnrollmentData,
  type EnrollmentForm,
} from "@/features/enrollment/model/enrollment-form";
import type { EnrollmentForm as FormContext } from "@/shared/contracts/enrollment";
import { ApiClientError } from "@/shared/lib/api-client";
import { useToast } from "@/shared/toast/useToast";

type Step = "code" | "form" | "done";

const message = (cause: unknown, fallback: string) =>
  cause instanceof ApiClientError ? cause.message : fallback;

// Public sign-up: the invite code (sent by WhatsApp) opens the form; the
// answer waits for the condominium's administration to approve it.
const Heading = () => (
  <h1 className="text-center text-[28px] font-extrabold tracking-tight text-fg">
    Cadastro de morador
  </h1>
);

export function EnrollmentFlow() {
  const [step, setStep] = useState<Step>("code");
  const [code, setCode] = useState("");
  const [form, setForm] = useState<EnrollmentForm>(EMPTY_ENROLLMENT);
  const [context, setContext] = useState<FormContext | null>(null);
  const [consent, setConsent] = useState(false);
  const [photo, setPhoto] = useState<ProfilePhoto | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const { showError } = useToast();
  const [pending, setPending] = useState(false);

  const units = context?.units ?? [];
  const errors = enrollmentErrors(form, units.length > 0);
  const invalid = Object.keys(errors).length > 0;

  async function verify(event: FormEvent) {
    event.preventDefault();
    setPending(true);
    try {
      setContext(await enrollmentClient.verifyCode(code));
      setStep("form");
    } catch (cause) {
      showError(message(cause, "Não foi possível conferir o código."));
    }
    setPending(false);
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    setSubmitted(true);
    if (invalid) return showError("Confira os campos destacados.");
    if (!consent) return showError("Marque o aceite do uso dos dados.");
    setPending(true);
    try {
      await enrollmentClient.submit(
        toEnrollmentData(form),
        consent,
        photo?.base64 ?? null,
      );
      setStep("done");
    } catch (cause) {
      // The 60 minutes ran out: the code opens the form again, data kept.
      if (
        cause instanceof ApiClientError &&
        cause.code === "ENROLLMENT_FORM_EXPIRED"
      ) {
        setStep("code");
        setCode("");
      }
      showError(message(cause, "Não foi possível enviar o cadastro."));
    }
    setPending(false);
  }

  if (step === "done") {
    return (
      <div className="space-y-4 text-center">
        <Heading />
        <CheckCircle2 className="mx-auto size-12 text-success" aria-hidden />
        <p className="text-lg font-semibold text-fg">Cadastro enviado!</p>
        <p className="text-sm text-muted">
          A administração do{" "}
          {context ? <strong>{context.condominiumName}</strong> : "condomínio"}{" "}
          vai conferir os seus dados. Quando o acesso for aprovado, você recebe
          o usuário e a senha no e-mail{" "}
          <strong className="text-fg">{form.email.trim()}</strong>.
        </p>
      </div>
    );
  }

  if (step === "code") {
    return (
      <form className="space-y-4" onSubmit={verify}>
        <Heading />
        <p className="text-sm text-muted">
          Digite o código que você recebeu da administração do condomínio.
        </p>
        <Field
          label="Código de acesso"
          required
          autoFocus
          inputMode="numeric"
          autoComplete="one-time-code"
          placeholder="000000"
          icon={<KeyRound className="size-4" />}
          value={code}
          onChange={(e) =>
            setCode(e.target.value.replace(/\D/g, "").slice(0, 6))
          }
          className="[&_input]:font-mono [&_input]:tracking-[0.3em]"
        />
        <Button
          type="submit"
          variant="brand"
          size="lg"
          className="w-full"
          loading={pending}
          disabled={code.length !== 6}
        >
          Continuar
        </Button>
      </form>
    );
  }

  return (
    <form className="space-y-5" onSubmit={submit} noValidate>
      <Heading />
      {context && (
        <div className="rounded-2xl bg-brand-soft px-4 py-3 text-center">
          <p className="text-xs font-semibold tracking-wide text-muted uppercase">
            Cadastro para
          </p>
          <p className="text-lg font-bold text-fg">{context.condominiumName}</p>
        </div>
      )}
      <p className="text-sm text-muted">
        Código confirmado. Preencha os seus dados: o acesso ao app é liberado
        depois da aprovação da administração.
      </p>
      <FormSection
        icon={<Camera />}
        title="Foto de perfil"
        description="Ajuda a administração a identificar você."
      >
        <ProfilePhotoField value={photo} onChange={setPhoto} />
      </FormSection>
      <EnrollmentFields
        form={form}
        onChange={setForm}
        errors={errors}
        showErrors={submitted}
        units={units}
      />
      <label className="flex cursor-pointer items-start gap-2 text-sm text-muted">
        <input
          type="checkbox"
          className="mt-0.5 size-4 shrink-0 accent-[var(--brand)]"
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
        />
        <span>
          Autorizo o uso destes dados pelo condomínio para reservas e avisos,
          conforme os{" "}
          <Link
            href="/termos"
            target="_blank"
            className="text-brand-ink underline-offset-2 hover:underline"
          >
            termos de uso e privacidade
          </Link>
          .
        </span>
      </label>
      <Button
        type="submit"
        variant="brand"
        size="lg"
        className="w-full"
        loading={pending}
        icon={<Send className="size-4" />}
      >
        Enviar cadastro
      </Button>
    </form>
  );
}
