"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Ban, Plus, Trash2 } from "lucide-react";
import {
  Alert,
  Button,
  Card,
  CardBody,
  CardHeader,
  Drawer,
  Field,
} from "@/design-system";
import { bookingsClient } from "@/features/bookings/api/bookings.client";
import type { SpaceBlock } from "@/shared/contracts/bookings";
import { ApiClientError } from "@/shared/lib/api-client";
import { formatDateTime, fromLocalInput } from "@/shared/lib/datetime";
import { useToast } from "@/shared/toast/useToast";

type Draft = { startsAt: string; endsAt: string; reason: string };

const EMPTY: Draft = { startsAt: "", endsAt: "", reason: "" };

// Periods the space is closed (maintenance, a condominium event). Everyone
// sees why; managers add and remove them. Active bookings in the period are
// only cancelled after the manager confirms it.
export function SpaceBlocksCard({
  spaceId,
  blocks,
  manager,
}: {
  spaceId: string;
  blocks: SpaceBlock[];
  /** BOOKINGS_MANAGE. */
  manager: boolean;
}) {
  const router = useRouter();
  const { showError, showSuccess } = useToast();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<Draft>(EMPTY);
  // Set when the API reports bookings in the period: confirm to cancel them.
  const [overlaps, setOverlaps] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  if (blocks.length === 0 && !manager) return null;

  const set = (key: keyof Draft, value: string) => {
    setDraft((current) => ({ ...current, [key]: value }));
    setOverlaps(null);
  };

  function close() {
    setOpen(false);
    setDraft(EMPTY);
    setOverlaps(null);
  }

  async function save(cancelOverlapping: boolean) {
    const startsAt = fromLocalInput(draft.startsAt);
    const endsAt = fromLocalInput(draft.endsAt);
    if (!startsAt || !endsAt) {
      showError("Informe o início e o fim do bloqueio.");
      return;
    }
    setPending(true);
    try {
      await bookingsClient.createBlock(spaceId, {
        startsAt,
        endsAt,
        reason: draft.reason,
        cancelOverlapping,
      });
      showSuccess(
        "Período bloqueado.",
        cancelOverlapping
          ? "As reservas do período foram canceladas e os moradores, avisados."
          : undefined,
      );
      close();
      router.refresh();
    } catch (cause) {
      if (
        cause instanceof ApiClientError &&
        cause.code === "BOOKING_BLOCK_OVERLAPS"
      ) {
        setOverlaps(cause.message);
      } else {
        showError(
          cause instanceof ApiClientError
            ? cause.message
            : "Não foi possível bloquear.",
        );
      }
    }
    setPending(false);
  }

  async function remove(block: SpaceBlock) {
    try {
      await bookingsClient.deleteBlock(block.id);
      showSuccess("Bloqueio removido: o período volta a aceitar reservas.");
      router.refresh();
    } catch (cause) {
      showError(
        cause instanceof ApiClientError
          ? cause.message
          : "Não foi possível remover.",
      );
    }
  }

  return (
    <Card>
      <CardHeader
        title="Bloqueios"
        description="Períodos em que o espaço não aceita reservas."
        action={
          manager ? (
            <Button
              size="sm"
              variant="secondary"
              icon={<Plus className="size-4" />}
              onClick={() => setOpen(true)}
            >
              Bloquear período
            </Button>
          ) : (
            <Ban aria-hidden className="size-5 text-soft" />
          )
        }
      />
      <CardBody className="pt-0">
        {blocks.length === 0 ? (
          <p className="text-sm text-muted">Nenhum bloqueio programado.</p>
        ) : (
          <ul className="divide-y divide-border">
            {blocks.map((block) => (
              <li
                key={block.id}
                className="flex items-start justify-between gap-3 py-2.5"
              >
                <div className="min-w-0 text-sm">
                  <p className="font-semibold text-fg">{block.reason}</p>
                  <p className="text-muted">
                    {formatDateTime(block.startsAt)} até{" "}
                    {formatDateTime(block.endsAt)}
                  </p>
                </div>
                {manager && (
                  <button
                    type="button"
                    onClick={() => remove(block)}
                    aria-label={`Remover bloqueio: ${block.reason}`}
                    title="Remover bloqueio"
                    className="grid size-8 shrink-0 place-items-center rounded-md text-danger transition-colors hover:bg-danger/10"
                  >
                    <Trash2 aria-hidden className="size-4" />
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </CardBody>

      <Drawer
        open={open}
        onClose={close}
        title="Bloquear período"
        busy={pending}
        footer={
          <>
            <Button variant="secondary" onClick={close} disabled={pending}>
              Cancelar
            </Button>
            {overlaps ? (
              <Button
                variant="danger"
                onClick={() => save(true)}
                loading={pending}
              >
                Bloquear e cancelar reservas
              </Button>
            ) : (
              <Button
                onClick={() => save(false)}
                loading={pending}
                disabled={!draft.startsAt || !draft.endsAt || !draft.reason}
              >
                Bloquear
              </Button>
            )}
          </>
        }
      >
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="Início"
              type="datetime-local"
              required
              value={draft.startsAt}
              onChange={(event) => set("startsAt", event.target.value)}
            />
            <Field
              label="Fim"
              type="datetime-local"
              required
              value={draft.endsAt}
              onChange={(event) => set("endsAt", event.target.value)}
            />
          </div>
          <Field
            label="Motivo"
            required
            maxLength={200}
            placeholder="Ex.: Manutenção da iluminação"
            value={draft.reason}
            onChange={(event) => set("reason", event.target.value)}
          />
          {overlaps && <Alert tone="warning">{overlaps}</Alert>}
          <p className="text-xs text-soft">
            O motivo aparece para os moradores no calendário do espaço.
          </p>
        </div>
      </Drawer>
    </Card>
  );
}
