"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { UserPlus } from "lucide-react";
import { Button, Drawer } from "@/design-system";
import { adminClient } from "@/features/admin/api/admin.client";
import { TemporaryAccessPanel } from "@/features/admin/components/TemporaryAccessPanel";
import { UserFormFields } from "@/features/admin/components/UserFormFields";
import type {
  TemporaryAccess,
  UserGroup,
  UserInput,
} from "@/shared/contracts/api";
import type { Unit } from "@/shared/contracts/condominiums";
import { ApiClientError } from "@/shared/lib/api-client";
import { useToast } from "@/shared/toast/useToast";

const EMPTY: UserInput = {
  name: "",
  email: "",
  username: "",
  group: "USER",
  unitId: null,
};

export function CreateUserButton({
  assignableGroups,
  units,
}: {
  assignableGroups: UserGroup[];
  units: Pick<Unit, "id" | "label">[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<UserInput>(EMPTY);
  const [created, setCreated] = useState<TemporaryAccess | null>(null);
  const { showError } = useToast();
  const [pending, setPending] = useState(false);

  function close() {
    setOpen(false);
    setForm(EMPTY);
    setCreated(null);
  }

  async function submit() {
    setPending(true);
    try {
      setCreated(await adminClient.createUser(form));
      router.refresh();
    } catch (cause) {
      showError(
        cause instanceof ApiClientError
          ? cause.message
          : "Não foi possível adicionar a pessoa.",
      );
    }
    setPending(false);
  }

  const complete = form.name && form.email;

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        icon={<UserPlus className="size-4" />}
      >
        Adicionar pessoa
      </Button>
      <Drawer
        open={open}
        onClose={close}
        title={
          created
            ? created.temporaryPassword
              ? "Acesso criado"
              : "Acesso liberado"
            : "Adicionar pessoa"
        }
        busy={pending}
        footer={
          created ? (
            <Button onClick={close}>Concluir</Button>
          ) : (
            <>
              <Button variant="secondary" onClick={close} disabled={pending}>
                Cancelar
              </Button>
              <Button onClick={submit} loading={pending} disabled={!complete}>
                Adicionar e enviar acesso
              </Button>
            </>
          )
        }
      >
        {created ? (
          <TemporaryAccessPanel access={created} />
        ) : (
          <div className="space-y-4">
            <UserFormFields
              value={form}
              onChange={setForm}
              assignableGroups={assignableGroups}
              units={units}
              mode="create"
            />
            <p className="text-xs text-soft">
              Conta nova: o sistema gera uma senha temporária e envia por
              e-mail. Se o e-mail já tiver conta no Dora (outro condomínio), a
              pessoa só ganha acesso a este.
            </p>
          </div>
        )}
      </Drawer>
    </>
  );
}
