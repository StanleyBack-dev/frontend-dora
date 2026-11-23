"use client";

import { useState } from "react";
import { History, RotateCcw } from "lucide-react";
import { Button } from "@/design-system/components/Button";
import { Modal } from "@/design-system/components/Modal";
import { cn } from "@/design-system/utils/cn";

// Above a form that came back from a draft: says so, and offers to start
// over. Starting over asks first (a slip would lose what was typed); only
// then is the draft discarded.
export function DraftNotice({
  onDiscard,
  className,
}: {
  onDiscard: () => void;
  className?: string;
}) {
  const [confirming, setConfirming] = useState(false);

  return (
    <div
      role="status"
      className={cn(
        "flex min-w-0 flex-col gap-2 rounded-xl border border-info-border bg-info-soft px-3 py-2.5 text-[13px] text-info sm:flex-row sm:items-center sm:justify-between",
        className,
      )}
    >
      <span className="flex min-w-0 items-start gap-2 sm:items-center">
        <History aria-hidden className="mt-0.5 size-4 shrink-0 sm:mt-0" />
        <span className="min-w-0 break-words whitespace-normal">
          <strong className="font-semibold">Rascunho recuperado:</strong>{" "}
          continue de onde parou.
        </span>
      </span>
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="inline-flex shrink-0 items-center gap-1.5 self-start rounded-md border border-info-border bg-surface/60 px-2.5 py-1 font-semibold transition-colors hover:bg-surface sm:self-auto"
      >
        <RotateCcw aria-hidden className="size-3.5" />
        Começar do zero
      </button>

      <Modal
        open={confirming}
        onClose={() => setConfirming(false)}
        title="Começar do zero?"
        icon={<RotateCcw className="size-4" />}
        tone="danger"
        footer={
          <>
            <Button variant="cancel" onClick={() => setConfirming(false)}>
              Continuar o rascunho
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                setConfirming(false);
                onDiscard();
              }}
            >
              Apagar e começar do zero
            </Button>
          </>
        }
      >
        <p className="text-sm text-muted">
          Tudo o que foi preenchido neste rascunho será apagado e o formulário
          volta ao início. Isso não pode ser desfeito.
        </p>
      </Modal>
    </div>
  );
}
