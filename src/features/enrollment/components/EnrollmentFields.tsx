"use client";

import { BriefcaseBusiness, House, UserRound, Users } from "lucide-react";
import {
  ChoiceCards,
  CollapsibleSection,
  Combobox,
  Field,
  type ChoiceOption,
} from "@/design-system";
import {
  APPLICANT_LABELS,
  type EnrollmentErrors,
  type EnrollmentForm,
} from "@/features/enrollment/model/enrollment-form";
import type { EnrollmentApplicant } from "@/shared/contracts/enrollment";

const APPLICANT_OPTIONS: ChoiceOption<EnrollmentApplicant>[] = [
  {
    value: "RESIDENT",
    title: APPLICANT_LABELS.RESIDENT,
    hint: "Moro no condomínio",
    icon: <House />,
  },
  {
    value: "EMPLOYEE",
    title: APPLICANT_LABELS.EMPLOYEE,
    hint: "Trabalho no condomínio",
    icon: <BriefcaseBusiness />,
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
  house = false,
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
  /** Houses: street, quadra and lote typed (never a list). */
  house?: boolean;
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
      <CollapsibleSection
        icon={<Users />}
        title="Vínculo com o condomínio"
        description={
          reviewing
            ? "O que a pessoa informou no cadastro."
            : "Você é morador ou funcionário do condomínio?"
        }
      >
        <ChoiceCards
          name="applicant"
          options={APPLICANT_OPTIONS.filter(
            (option) => !reviewing || option.value === form.applicant,
          )}
          value={form.applicant}
          onChange={(value) => !reviewing && set("applicant", value)}
        />
        {employee && (
          <p className="text-xs text-soft">
            {reviewing
              ? "Funcionário: sem unidade nem endereço. Aprove como Portaria ou Administrador."
              : "Funcionários não informam endereço. A administração define o seu acesso na aprovação."}
          </p>
        )}
      </CollapsibleSection>
      <CollapsibleSection
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
      </CollapsibleSection>
      {!employee && (
        <CollapsibleSection
          icon={<House />}
          title="Endereço no condomínio"
          description={
            house
              ? "A rua, a quadra e o lote da sua casa e, se precisar, um complemento."
              : units.length > 0
                ? "A sua unidade e, se precisar, um complemento."
                : "O condomínio ainda não tem unidades cadastradas: digite o bloco (ou torre) e o número."
          }
        >
          {house ? (
            <>
              <Field
                label="Rua"
                required
                placeholder="Ex.: Rua das Flores"
                maxLength={80}
                autoComplete="address-line1"
                value={form.unitStreet}
                onChange={(e) => set("unitStreet", e.target.value)}
                error={error("unitStreet")}
              />
              <div className="grid grid-cols-2 gap-4">
                <Field
                  label="Quadra"
                  required
                  placeholder="Ex.: 3"
                  maxLength={30}
                  value={form.unitBlock}
                  onChange={(e) => set("unitBlock", e.target.value)}
                  error={error("unitBlock")}
                />
                <Field
                  label="Lote"
                  required
                  placeholder="Ex.: 12"
                  maxLength={20}
                  value={form.unitNumber}
                  onChange={(e) => set("unitNumber", e.target.value)}
                  error={error("unitNumber")}
                />
              </div>
            </>
          ) : units.length > 0 ? (
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
          {reviewing && (house || units.length === 0) && (
            <p className="text-xs text-soft">
              {house
                ? "Ao aprovar, a casa é vinculada à pessoa (e cadastrada em Unidades, se ainda não existir)."
                : "Ao aprovar, a unidade digitada é vinculada à pessoa (e cadastrada em Unidades, se ainda não existir)."}
            </p>
          )}
        </CollapsibleSection>
      )}
    </>
  );
}
