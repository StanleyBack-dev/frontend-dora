"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Pencil, Power, PowerOff, Trash2 } from "lucide-react";
import { Button, buttonClasses, Modal } from "@/design-system";
import { spacesClient } from "@/features/spaces/api/spaces.client";
import type { Space } from "@/shared/contracts/spaces";
import { ApiClientError } from "@/shared/lib/api-client";
import { useToast } from "@/shared/toast/useToast";

type Confirming = "toggle" | "delete" | null;

// What a manager can do with a space: edit, deactivate (maintenance) or
// delete it.
export function SpaceManageActions({ space }: { space: Space }) {
  const router = useRouter();
  const { showError, showSuccess } = useToast();
  const [confirming, setConfirming] = useState<Confirming>(null);
  const [pending, setPending] = useState(false);

  async function run() {
    setPending(true);
    try {
      if (confirming === "toggle") {
        await spacesClient.setActive(space.id, !space.active);
        showSuccess(space.active ? "Espaço desativado." : "Espaço reativado.");
        setConfirming(null);
        router.refresh();
      } else if (confirming === "delete") {
        await spacesClient.remove(space.id);
        showSuccess(`${space.name} excluído.`);
        router.push("/espacos");
        router.refresh();
      }
    } catch (cause) {
      showError(
        cause instanceof ApiClientError
          ? cause.message
          : "Não foi possível concluir a ação.",
      );
    }
    setPending(false);
  }

  const deactivating = space.active;

  return (
    <>
      <div className="flex flex-wrap gap-2">
        <Link
          href={`/espacos/${space.id}/editar`}
          className={buttonClasses("primary", "sm")}
        >
          <Pencil aria-hidden className="mr-1.5 size-4" />
          Editar
        </Link>
        <Button
          size="sm"
          variant="secondary"
          icon={
            deactivating ? (
              <PowerOff className="size-4" />
            ) : (
              <Power className="size-4" />
            )
          }
          onClick={() => setConfirming("toggle")}
        >
          {deactivating ? "Desativar" : "Reativar"}
        </Button>
        <Button
          size="sm"
          variant="ghost"
          icon={<Trash2 className="size-4" />}
          onClick={() => setConfirming("delete")}
        >
          Excluir
        </Button>
      </div>

      <Modal
        open={confirming !== null}
        onClose={() => setConfirming(null)}
        title={
          confirming === "delete"
            ? "Excluir espaço"
            : deactivating
              ? "Desativar espaço"
              : "Reativar espaço"
        }
        tone={confirming === "delete" ? "danger" : "neutral"}
        busy={pending}
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => setConfirming(null)}
              disabled={pending}
            >
              Cancelar
            </Button>
            <Button
              variant={confirming === "delete" ? "danger" : "primary"}
              onClick={run}
              loading={pending}
            >
              Confirmar
            </Button>
          </>
        }
      >
        {confirming === "delete"
          ? `${space.name} será excluído com as suas regras. Esta ação não pode ser desfeita. Se for só uma pausa (reforma, manutenção), prefira desativar.`
          : deactivating
            ? `${space.name} sai da lista dos moradores e não aceita reservas até ser reativado. Os dados e as regras continuam guardados.`
            : `${space.name} volta a aparecer para os moradores.`}
      </Modal>
    </>
  );
}
