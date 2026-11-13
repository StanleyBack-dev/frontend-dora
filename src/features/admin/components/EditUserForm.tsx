"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Save } from "lucide-react";
import { Alert, Button } from "@/design-system";
import { adminClient } from "@/features/admin/api/admin.client";
import { UserFormFields } from "@/features/admin/components/UserFormFields";
import type { UserAccount, UserGroup, UserInput } from "@/shared/contracts/api";
import type { Unit } from "@/shared/contracts/condominiums";
import { ApiClientError } from "@/shared/lib/api-client";
import { useToast } from "@/shared/toast/useToast";

export function EditUserForm({
  user,
  assignableGroups,
  units,
  accountLocked,
}: {
  user: UserAccount;
  assignableGroups: UserGroup[];
  units: Pick<Unit, "id" | "label">[];
  /** Shared account: only role and unit can change here. */
  accountLocked: boolean;
}) {
  const router = useRouter();
  const initial: UserInput = {
    name: user.name,
    email: user.email,
    username: user.username,
    group: user.group,
    unitId: user.unitId,
  };
  const [form, setForm] = useState<UserInput>(initial);
  const { showError } = useToast();
  const [saved, setSaved] = useState(false);
  const [pending, setPending] = useState(false);

  // Only the fields that changed are sent.
  const changes = Object.fromEntries(
    Object.entries(form).filter(
      ([key, value]) => initial[key as keyof UserInput] !== value,
    ),
  ) as Partial<UserInput>;
  const dirty = Object.keys(changes).length > 0;

  async function submit(event: FormEvent) {
    event.preventDefault();
    setPending(true);
    setSaved(false);
    try {
      await adminClient.updateUser(user.id, changes);
      setSaved(true);
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
      {saved && <Alert tone="success">Alterações salvas.</Alert>}
      {changes.group && (
        <Alert tone="info">
          Ao trocar o papel, as permissões personalizadas desta pessoa voltam ao
          padrão do novo papel.
        </Alert>
      )}
      <UserFormFields
        value={form}
        onChange={setForm}
        assignableGroups={
          assignableGroups.includes(user.group)
            ? assignableGroups
            : [user.group, ...assignableGroups]
        }
        units={units}
        mode="edit"
        accountLocked={accountLocked}
      />
      <Button
        type="submit"
        loading={pending}
        disabled={!dirty}
        icon={<Save className="size-4" />}
      >
        Salvar alterações
      </Button>
    </form>
  );
}
