"use client";

import {
  BriefcaseBusiness,
  ClipboardList,
  House,
  KeyRound,
  UserRound,
  Users,
} from "lucide-react";
import {
  Alert,
  ChoiceCards,
  CollapsibleSection,
  Field,
  Select,
  type ChoiceOption,
} from "@/design-system";
import { GroupChoice } from "@/features/access/components/GroupChoice";
import { KIND_LABELS, rolesFor } from "@/features/admin/model/member-kind";
import type {
  EmployeeProfile,
  EmployeeProfileInput,
  MemberKind,
  UserGroup,
  UserInput,
} from "@/shared/contracts/api";
import type { Unit } from "@/shared/contracts/condominiums";
import { maskPhone, phoneError } from "@/shared/lib/masks";
import { birthDateError, todayIso } from "@/shared/lib/birth-date";

const KIND_OPTIONS: ChoiceOption<MemberKind>[] = [
  {
    value: "RESIDENT",
    title: KIND_LABELS.RESIDENT,
    hint: "Mora no condomínio",
    icon: <House />,
  },
  {
    value: "EMPLOYEE",
    title: KIND_LABELS.EMPLOYEE,
    hint: "Trabalha no condomínio",
    icon: <BriefcaseBusiness />,
  },
];

const NO_EMPLOYEE: EmployeeProfile = {
  jobTitle: "",
  hiredOn: "",
  workShift: "",
  contractor: "",
};

/** Today (local), the latest hiring date. */
const today = () => new Date().toLocaleDateString("en-CA");

// A person's data in the condominium, in the same sections as the sign-up
// (Vínculo, Dados pessoais, Endereço / Ficha, Acesso ao app). The login is
// not typed: the API makes it from the name (nome.sobrenome) and the e-mail
// also signs in. The tie (resident or employee) decides the rest: a resident
// has a unit, an employee a staff record; the role only sets permissions.
export function UserFormFields({
  value,
  onChange,
  assignableGroups,
  units,
  accountLocked = false,
}: {
  value: UserInput;
  onChange: (value: UserInput) => void;
  /** Roles the current manager may assign (the API enforces it again). */
  assignableGroups: UserGroup[];
  /** Units of the condominium (empty: it has none registered). */
  units: Pick<Unit, "id" | "label">[];
  /**
   * The account is also used in another condominium: name, e-mail and
   * phone are not this condominium's to change.
   */
  accountLocked?: boolean;
}) {
  const set = <K extends keyof UserInput>(key: K, field: UserInput[K]) =>
    onChange({ ...value, [key]: field });
  const phone = value.phone ?? "";
  const resident = value.kind === "RESIDENT";
  const fitting = rolesFor(value.kind, assignableGroups);
  // A role from before the tie existed stays visible until changed.
  const roles = fitting.includes(value.group)
    ? fitting
    : [value.group, ...fitting];
  const employee: EmployeeProfileInput = value.employee ?? NO_EMPLOYEE;
  const setEmployee = (patch: EmployeeProfileInput) =>
    set("employee", { ...employee, ...patch });

  // Switching the tie clears the other tie's data and keeps a role of it.
  function chooseKind(kind: MemberKind) {
    const fits = rolesFor(kind, assignableGroups);
    onChange({
      ...value,
      kind,
      group: fits.includes(value.group) ? value.group : (fits[0] ?? "USER"),
      ...(kind === "EMPLOYEE"
        ? { unitId: null, unitComplement: null, employee: NO_EMPLOYEE }
        : { employee: null }),
    });
  }

  return (
    <div className="space-y-4">
      {accountLocked && (
        <Alert tone="info">
          Esta pessoa também usa o Dora em outro condomínio. Nome, e-mail e
          telefone só podem ser alterados por ela mesma (em Meu perfil) ou pela
          administração do Dora. Aqui você ajusta o vínculo, o papel e os dados
          {resident ? " da unidade" : " de funcionário"}.
        </Alert>
      )}

      <CollapsibleSection
        icon={<Users />}
        title="Vínculo com o condomínio"
        description="Mora ou trabalha no condomínio?"
      >
        <ChoiceCards
          name="kind"
          options={KIND_OPTIONS}
          value={value.kind}
          onChange={chooseKind}
        />
      </CollapsibleSection>

      <CollapsibleSection
        icon={<UserRound />}
        title="Dados pessoais"
        description="Como falar com a pessoa e como ela entra no app."
      >
        <Field
          label="Nome completo"
          required
          disabled={accountLocked}
          value={value.name}
          onChange={(event) => set("name", event.target.value)}
        />
        <div>
          <Field
            label="E-mail"
            type="email"
            required
            disabled={accountLocked}
            value={value.email}
            onChange={(event) => set("email", event.target.value)}
          />
          <p className="mt-1.5 text-xs text-soft">
            O login é criado a partir do nome (ex.: ana.souza); o e-mail também
            serve para entrar.
          </p>
        </div>
        <Field
          label="Telefone (WhatsApp)"
          type="tel"
          inputMode="tel"
          disabled={accountLocked}
          placeholder="(62) 99999-0000"
          value={phone}
          onChange={(event) => set("phone", maskPhone(event.target.value))}
          error={(phone && phoneError(phone)) || undefined}
        />
        <Field
          label="Data de nascimento"
          type="date"
          disabled={accountLocked}
          max={todayIso()}
          value={value.birthDate ?? ""}
          onChange={(event) => set("birthDate", event.target.value)}
          error={birthDateError(value.birthDate ?? "", false) ?? undefined}
        />
      </CollapsibleSection>

      {resident ? (
        <CollapsibleSection
          icon={<House />}
          title="Endereço no condomínio"
          description="A unidade onde a pessoa mora."
        >
          {units.length > 0 ? (
            <Select
              label="Unidade"
              placeholder="Sem unidade"
              value={value.unitId ?? ""}
              onChange={(event) => set("unitId", event.target.value || null)}
              options={units.map((unit) => ({
                value: unit.id,
                label: unit.label,
              }))}
            />
          ) : (
            <p className="rounded-lg border border-dashed border-border p-3 text-xs text-soft">
              O condomínio ainda não tem unidades cadastradas. Cadastre em
              Administração → Unidades para vincular moradores.
            </p>
          )}
          <Field
            label="Complemento"
            placeholder="Ex.: casa dos fundos, sala 2 (opcional)"
            maxLength={80}
            value={value.unitComplement ?? ""}
            onChange={(event) => set("unitComplement", event.target.value)}
          />
        </CollapsibleSection>
      ) : (
        <CollapsibleSection
          icon={<ClipboardList />}
          title="Ficha do funcionário"
          description="Cargo e jornada. Todos os campos são opcionais."
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="Cargo"
              placeholder="Ex.: Porteiro, Zelador"
              maxLength={60}
              value={employee.jobTitle ?? ""}
              onChange={(event) =>
                setEmployee({ jobTitle: event.target.value })
              }
            />
            <Field
              label="Data de admissão"
              type="date"
              max={today()}
              value={employee.hiredOn ?? ""}
              onChange={(event) => setEmployee({ hiredOn: event.target.value })}
            />
            <Field
              label="Turno / jornada"
              placeholder="Ex.: Diurno 7h–19h, 12x36"
              maxLength={80}
              value={employee.workShift ?? ""}
              onChange={(event) =>
                setEmployee({ workShift: event.target.value })
              }
            />
            <Field
              label="Empresa terceirizada"
              placeholder="Se não for contratado direto"
              maxLength={120}
              value={employee.contractor ?? ""}
              onChange={(event) =>
                setEmployee({ contractor: event.target.value })
              }
            />
          </div>
        </CollapsibleSection>
      )}

      <CollapsibleSection
        icon={<KeyRound />}
        title="Acesso ao app"
        description="O papel define o que a pessoa pode fazer no app."
      >
        <GroupChoice
          groups={roles}
          value={value.group}
          onChange={(group) => set("group", group)}
        />
      </CollapsibleSection>
    </div>
  );
}
