"use client";

import { Field, Select } from "@/design-system";
import {
  maskPixKey,
  PIX_KEY_TYPES,
  pixKeyError,
  type PixKeyType,
} from "@/shared/lib/pix-key";

/** The PIX receiver as the form edits it. */
export type PixReceiverForm = {
  keyType: PixKeyType | "";
  key: string;
  name: string;
  city: string;
};

export const EMPTY_PIX_RECEIVER: PixReceiverForm = {
  keyType: "",
  key: "",
  name: "",
  city: "",
};

/** What is still missing or wrong (in form order). */
export function pixReceiverMissing(form: PixReceiverForm): string[] {
  const out: string[] = [];
  const keyProblem = pixKeyError(form.keyType, form.key);
  if (keyProblem) out.push(`Chave PIX: ${keyProblem}`);
  if (!form.name.trim()) out.push("O nome de quem recebe o PIX.");
  if (!form.city.trim()) out.push("A cidade de quem recebe o PIX.");
  return out;
}

// Who receives a PIX: the key type first (CPF, CNPJ, celular, e-mail or
// random key), then the key with that type's mask and checks, the receiver's
// name and city. Changing the type clears the key (a CPF is not a phone).
export function PixReceiverFields({
  value,
  onChange,
}: {
  value: PixReceiverForm;
  onChange: (value: PixReceiverForm) => void;
}) {
  const type = PIX_KEY_TYPES.find((item) => item.value === value.keyType);
  const keyProblem =
    value.keyType && value.key.trim()
      ? pixKeyError(value.keyType, value.key)
      : null;

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-[12rem_1fr]">
        <Select
          label="Tipo de chave"
          required
          placeholder="Escolha"
          value={value.keyType}
          onChange={(event) =>
            onChange({
              ...value,
              keyType: event.target.value as PixKeyType,
              key: "",
            })
          }
          options={PIX_KEY_TYPES.map((item) => ({
            value: item.value,
            label: item.label,
          }))}
        />
        <Field
          label="Chave PIX"
          required
          disabled={!value.keyType}
          inputMode={type?.inputMode}
          autoCapitalize="none"
          spellCheck={false}
          placeholder={type?.placeholder ?? "Escolha o tipo primeiro"}
          value={value.key}
          onChange={(event) =>
            onChange({
              ...value,
              key: maskPixKey(value.keyType, event.target.value),
            })
          }
          error={keyProblem ?? undefined}
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label="Nome de quem recebe"
          required
          maxLength={25}
          placeholder="Como aparece no banco"
          value={value.name}
          onChange={(event) => onChange({ ...value, name: event.target.value })}
        />
        <Field
          label="Cidade"
          required
          maxLength={15}
          placeholder="Ex.: Goiânia"
          value={value.city}
          onChange={(event) => onChange({ ...value, city: event.target.value })}
        />
      </div>
    </div>
  );
}
