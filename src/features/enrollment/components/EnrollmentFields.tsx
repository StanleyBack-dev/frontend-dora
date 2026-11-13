"use client";

import { UserRound } from "lucide-react";
import { Field, FormSection } from "@/design-system";
import type {
  EnrollmentErrors,
  EnrollmentForm,
} from "@/features/enrollment/model/enrollment-form";
import { maskPhone } from "@/shared/lib/masks";

// The sign-up data: the public form and the manager's review share it.
export function EnrollmentFields({
  form,
  onChange,
  errors,
  showErrors,
  autoFocus = false,
}: {
  form: EnrollmentForm;
  onChange: (form: EnrollmentForm) => void;
  errors: EnrollmentErrors;
  /** Errors appear after the first attempt to send. */
  showErrors: boolean;
  autoFocus?: boolean;
}) {
  const set = <K extends keyof EnrollmentForm>(
    key: K,
    value: EnrollmentForm[K],
  ) => onChange({ ...form, [key]: value });
  const error = (key: keyof EnrollmentForm) =>
    showErrors ? errors[key] : undefined;

  return (
    <FormSection
      icon={<UserRound />}
      title="Dados pessoais"
      description="A senha de acesso chega no seu e-mail depois da aprovação."
    >
      <Field
        label="Nome completo"
        required
        autoComplete="name"
        data-autofocus={autoFocus || undefined}
        value={form.fullName}
        onChange={(e) => set("fullName", e.target.value)}
        error={error("fullName")}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label="E-mail"
          required
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder="voce@exemplo.com"
          value={form.email}
          onChange={(e) => set("email", e.target.value)}
          error={error("email")}
        />
        <Field
          label="Telefone (WhatsApp)"
          required
          type="tel"
          inputMode="tel"
          autoComplete="tel-national"
          placeholder="(62) 99999-0000"
          value={form.phone}
          onChange={(e) => set("phone", maskPhone(e.target.value))}
          error={error("phone")}
        />
      </div>
    </FormSection>
  );
}
