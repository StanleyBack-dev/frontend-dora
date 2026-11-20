"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { UserPlus } from "lucide-react";
import { Button, DraftNotice, Drawer } from "@/design-system";
import { adminClient } from "@/features/admin/api/admin.client";
import { TemporaryAccessPanel } from "@/features/admin/components/TemporaryAccessPanel";
import { UserFormFields } from "@/features/admin/components/UserFormFields";
import { rolesFor } from "@/features/admin/model/member-kind";
import type {
  MemberKind,
  TemporaryAccess,
  UserGroup,
  UserInput,
} from "@/shared/contracts/api";
import type { Unit } from "@/shared/contracts/condominiums";
import { ApiClientError } from "@/shared/lib/api-client";
import { sameShape } from "@/shared/lib/form-draft";
import { useFormDraft } from "@/shared/lib/use-form-draft";
import { useToast } from "@/shared/toast/useToast";

export function CreateUserButton({
  kind,
  assignableGroups,
  units,
}: {
  /** The page's tie: Moradores adds residents, Equipe employees. */
  kind: MemberKind;
  assignableGroups: UserGroup[];
  units: Pick<Unit, "id" | "label">[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  // The page's tie and its first role (resident; or the gate) by default.
  const empty: UserInput = {
    name: "",
    email: "",
    kind,
    group: rolesFor(kind, assignableGroups)[0] ?? "USER",
    unitId: null,
    unitComplement: "",
    employee: null,
    phone: "",
    birthDate: "",
  };
  // A draft per page (residents or team): kept when the drawer closes.
  const {
    value: form,
    set: setForm,
    discard,
    restored,
  } = useFormDraft<UserInput>(
    `create-user:${kind}`,
    empty,
    (raw) => sameShape(empty, raw),
    { open },
  );
  const [created, setCreated] = useState<TemporaryAccess | null>(null);
  const { showError } = useToast();
  const [pending, setPending] = useState(false);

  // X, Esc or a tap outside: the drawer hides and what was typed stays.
  function hide() {
    setOpen(false);
    if (created) finish();
  }

  // "Cancelar": the form starts over.
  function cancel() {
    discard();
    setOpen(false);
  }

  function finish() {
    setOpen(false);
    setCreated(null);
  }

  async function submit() {
    setPending(true);
    try {
      setCreated(await adminClient.createUser(form));
      discard();
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
        variant="brand"
        onClick={() => setOpen(true)}
        icon={<UserPlus className="size-4" />}
      >
        Adicionar pessoa
      </Button>
      <Drawer
        open={open}
        onClose={hide}
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
            <Button onClick={finish}>Concluir</Button>
          ) : (
            <>
              <Button variant="cancel" onClick={cancel} disabled={pending}>
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
            {restored && <DraftNotice onDiscard={discard} />}
            <UserFormFields
              value={form}
              onChange={setForm}
              assignableGroups={assignableGroups}
              units={units}
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
