"use client";

import { Alert, Field, Select } from "@/design-system";
import {
  GROUP_DESCRIPTIONS,
  GROUP_LABELS,
} from "@/features/access/model/access-labels";
import type { UserGroup, UserInput } from "@/shared/contracts/api";
import type { Unit } from "@/shared/contracts/condominiums";
import { maskUsername, usernameError } from "@/shared/lib/masks";

export function UserFormFields({
  value,
  onChange,
  assignableGroups,
  units,
  mode,
  accountLocked = false,
}: {
  value: UserInput;
  onChange: (value: UserInput) => void;
  /** Roles the current manager may assign (the API enforces it again). */
  assignableGroups: UserGroup[];
  /** Units of the condominium (empty: it has none registered). */
  units: Pick<Unit, "id" | "label">[];
  /** On create the login is optional (generated from the name). */
  mode: "create" | "edit";
  /**
   * The account is also used in another condominium: name, e-mail and login
   * are not this condominium's to change.
   */
  accountLocked?: boolean;
}) {
  const set = <K extends keyof UserInput>(key: K, field: UserInput[K]) =>
    onChange({ ...value, [key]: field });
  const username = value.username ?? "";

  return (
    <div className="space-y-4">
      {accountLocked && (
        <Alert tone="info">
          Esta pessoa também usa o Dora em outro condomínio. Nome, e-mail e
          login só podem ser alterados por ela mesma (em Meu perfil) ou pela
          administração do Dora. Aqui você ajusta o papel e a unidade.
        </Alert>
      )}
      <Field
        label="Nome completo"
        required
        disabled={accountLocked}
        value={value.name}
        onChange={(event) => set("name", event.target.value)}
      />
      <Field
        label="E-mail"
        type="email"
        required
        disabled={accountLocked}
        value={value.email}
        onChange={(event) => set("email", event.target.value)}
      />
      <div>
        <Field
          label="Usuário (login)"
          autoCapitalize="none"
          spellCheck={false}
          required={mode === "edit"}
          disabled={accountLocked}
          placeholder={mode === "create" ? "Gerado a partir do nome" : ""}
          value={username}
          onChange={(event) =>
            set("username", maskUsername(event.target.value))
          }
          error={(username && usernameError(username)) || undefined}
        />
        <p className="mt-1.5 text-xs text-soft">
          {mode === "create"
            ? "Opcional. Em branco, o login vira nome.sobrenome (ex.: ana.souza). O e-mail também serve para entrar."
            : "3 a 32 caracteres: letras minúsculas, números, ponto, hífen ou sublinhado."}
        </p>
      </div>
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
      <div>
        <Select
          label="Papel no condomínio"
          required
          value={value.group}
          onChange={(event) => set("group", event.target.value as UserGroup)}
          options={assignableGroups.map((group) => ({
            value: group,
            label: GROUP_LABELS[group],
          }))}
        />
        <p className="mt-1.5 text-xs text-soft">
          {GROUP_DESCRIPTIONS[value.group]}
        </p>
      </div>
    </div>
  );
}
