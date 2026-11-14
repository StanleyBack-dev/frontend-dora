"use client";

import { House, UserRound } from "lucide-react";
import { Combobox, Field, FormSection } from "@/design-system";
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

  return (
    <>
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
            Ao aprovar, a unidade digitada é vinculada à pessoa (e cadastrada em
            Unidades, se ainda não existir).
          </p>
        )}
      </FormSection>
    </>
  );
}
