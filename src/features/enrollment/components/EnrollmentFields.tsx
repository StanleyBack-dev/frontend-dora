"use client";

import { BriefcaseBusiness, House, UserRound } from "lucide-react";
import { Combobox, Field, FormSection, cn } from "@/design-system";
import {
  APPLICANT_LABELS,
  type EnrollmentErrors,
  type EnrollmentForm,
} from "@/features/enrollment/model/enrollment-form";
import type { EnrollmentApplicant } from "@/shared/contracts/enrollment";

const APPLICANT_OPTIONS: {
  value: EnrollmentApplicant;
  hint: string;
  icon: React.ReactNode;
}[] = [
  {
    value: "RESIDENT",
    hint: "Moro no condomínio",
    icon: <House aria-hidden className="size-5" />,
  },
  {
    value: "EMPLOYEE",
    hint: "Trabalho no condomínio",
    icon: <BriefcaseBusiness aria-hidden className="size-5" />,
  },
];
import { maskPhone } from "@/shared/lib/masks";

// The sign-up data: the public form and the manager's review share it.
export function EnrollmentFields({
  form,
  onChange,
  errors,
  showErrors,
  units = [],
  autoFocus = false,
  typedUnitLabel = null,
  reviewing = false,
}: {
  form: EnrollmentForm;
  onChange: (form: EnrollmentForm) => void;
  errors: EnrollmentErrors;
  /** Errors appear after the first attempt to send. */
  showErrors: boolean;
  /** The condominium's units (empty: it has none, no unit is asked). */
  units?: { id: string; label: string }[];
  autoFocus?: boolean;
  /** What the person typed when there were no units (review only). */
  typedUnitLabel?: string | null;
  /** The manager's review (shows what happens on approval). */
  reviewing?: boolean;
}) {
  const set = <K extends keyof EnrollmentForm>(
    key: K,
    value: EnrollmentForm[K],
  ) => onChange({ ...form, [key]: value });
  const error = (key: keyof EnrollmentForm) =>
    showErrors ? errors[key] : undefined;

  const employee = form.applicant === "EMPLOYEE";

  return (
    <>
      <fieldset>
        <legend className="mb-2 text-sm font-semibold text-fg">
          Você é morador ou funcionário do condomínio?
          {!reviewing && <span className="text-danger"> *</span>}
        </legend>
        <div className="grid grid-cols-2 gap-3">
          {APPLICANT_OPTIONS.map((option) => {
            const checked = form.applicant === option.value;
            return (
              <label
                key={option.value}
                className={cn(
                  "flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring",
                  checked
                    ? "border-accent bg-accent-soft text-fg"
                    : "border-border text-muted hover:border-border-strong",
                  reviewing && !checked && "hidden",
                  reviewing && "cursor-default",
                )}
              >
                <input
                  type="radio"
                  name="applicant"
                  value={option.value}
                  checked={checked}
                  disabled={reviewing}
                  onChange={() => set("applicant", option.value)}
                  className="sr-only"
                />
                <span className={checked ? "text-accent" : "text-soft"}>
                  {option.icon}
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-semibold">
                    {APPLICANT_LABELS[option.value]}
                  </span>
                  <span className="block text-xs text-muted">
                    {option.hint}
                  </span>
                </span>
              </label>
            );
          })}
        </div>
        {employee && (
          <p className="mt-2 text-xs text-soft">
            {reviewing
              ? "Funcionário: sem unidade nem endereço. Aprove como Portaria ou Administrador."
              : "Funcionários não informam endereço. A administração define o seu acesso na aprovação."}
          </p>
        )}
      </fieldset>
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
      {!employee && (
        <FormSection
          icon={<House />}
          title="Endereço no condomínio"
          description={
            units.length > 0
              ? "A sua unidade e, se precisar, um complemento."
              : "O condomínio ainda não tem unidades cadastradas: digite o bloco (ou torre) e o número."
          }
        >
          {units.length > 0 ? (
            <div>
              <Combobox
                label="Unidade"
                required
                placeholder="Busque o bloco ou o número"
                value={form.unitId || null}
                onSelect={(value) => set("unitId", value ?? "")}
                options={units.map((unit) => ({
                  value: unit.id,
                  label: unit.label,
                }))}
                emptyText="Nenhuma unidade com esse nome"
              />
              {error("unitId") && (
                <p
                  role="alert"
                  className="mt-1.5 text-xs font-medium text-danger"
                >
                  {error("unitId")}
                </p>
              )}
              {reviewing && typedUnitLabel && (
                <p className="mt-1.5 text-xs text-soft">
                  A pessoa digitou: <strong>{typedUnitLabel}</strong>.
                </p>
              )}
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label="Bloco ou torre"
                placeholder="Ex.: Bloco A (se houver)"
                maxLength={30}
                value={form.unitBlock}
                onChange={(e) => set("unitBlock", e.target.value)}
                error={error("unitBlock")}
              />
              <Field
                label="Número"
                required
                placeholder="Ex.: 101 ou Casa 12"
                maxLength={20}
                value={form.unitNumber}
                onChange={(e) => set("unitNumber", e.target.value)}
                error={error("unitNumber")}
              />
            </div>
          )}
          <div>
            <Field
              label="Complemento"
              placeholder="Ex.: casa dos fundos, sala 2"
              maxLength={80}
              value={form.unitComplement}
              onChange={(e) => set("unitComplement", e.target.value)}
              error={error("unitComplement")}
            />
            <p className="mt-1.5 text-xs text-soft">Opcional.</p>
          </div>
          {reviewing && units.length === 0 && (
            <p className="text-xs text-soft">
              Ao aprovar, a unidade digitada é vinculada à pessoa (e cadastrada
              em Unidades, se ainda não existir).
            </p>
          )}
        </FormSection>
      )}
    </>
  );
}
