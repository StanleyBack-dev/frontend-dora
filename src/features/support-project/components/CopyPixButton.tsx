"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { Button } from "@/design-system";
import { useToast } from "@/shared/toast/useToast";

// "Pix copia e cola": the code goes to the clipboard, to paste in the bank's
// app (on the phone, where the QR can't be scanned).
export function CopyPixButton({ payload }: { payload: string }) {
  const { showError, showSuccess } = useToast();
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(payload);
      setCopied(true);
      showSuccess(
        "Código Pix copiado.",
        "Cole no app do seu banco, em Pix → Copia e cola.",
      );
    } catch {
      showError("Não foi possível copiar. Selecione o código e copie.");
    }
  }

  return (
    <Button
      type="button"
      variant="brand"
      onClick={copy}
      icon={copied ? <Check className="size-4" /> : <Copy className="size-4" />}
    >
      {copied ? "Código copiado" : "Copiar código Pix"}
    </Button>
  );
}
