"use client";

import { useState } from "react";
import { FileDown } from "lucide-react";
import { Button } from "@/design-system";
import { parcelsClient } from "@/features/parcels/api/parcels.client";
import { ApiClientError } from "@/shared/lib/api-client";
import { useToast } from "@/shared/toast/useToast";

// Downloads the pickup receipt as a PDF: the API builds it (a few seconds),
// so the button shows it is working until the file arrives.
export function ReceiptPdfButton({ parcelId }: { parcelId: string }) {
  const { showError } = useToast();
  const [loading, setLoading] = useState(false);

  async function download() {
    setLoading(true);
    try {
      const { blob, fileName } = await parcelsClient.receiptPdf(parcelId);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName ?? "comprovante-encomenda.pdf";
      document.body.append(link);
      link.click();
      link.remove();
      // Some browsers read the file after click() returns.
      setTimeout(() => URL.revokeObjectURL(url), 10_000);
    } catch (cause) {
      showError(
        cause instanceof ApiClientError
          ? cause.message
          : "Não foi possível baixar o comprovante.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      variant="brand"
      loading={loading}
      icon={<FileDown className="size-4" />}
      onClick={() => void download()}
    >
      {loading ? "Gerando o PDF…" : "Baixar comprovante em PDF"}
    </Button>
  );
}
