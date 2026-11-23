"use client";

import type { ReactNode } from "react";
import { Button } from "@/design-system/components/Button";
import { Modal } from "@/design-system/components/Modal";

/**
 * Asks before an action that removes or undoes something: the message,
 * "Cancelar" and the action's button (red with the danger tone).
 */
export function ConfirmModal({
  open,
  title,
  confirmLabel,
  tone = "danger",
  pending,
  onConfirm,
  onClose,
  children,
}: {
  open: boolean;
  title: string;
  confirmLabel: string;
  tone?: "neutral" | "danger";
  pending: boolean;
  onConfirm: () => void;
  onClose: () => void;
  children: ReactNode;
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      tone={tone}
      busy={pending}
      footer={
        <>
          <Button variant="cancel" onClick={onClose} disabled={pending}>
            Cancelar
          </Button>
          <Button
            variant={tone === "danger" ? "danger" : "primary"}
            onClick={onConfirm}
            loading={pending}
          >
            {confirmLabel}
          </Button>
        </>
      }
    >
      {children}
    </Modal>
  );
}
