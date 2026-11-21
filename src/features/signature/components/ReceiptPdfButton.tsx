"use client";

import { useState } from "react";
import { FileDown } from "lucide-react";
import { Button } from "@/design-system";
import { ApiClientError, apiDownload } from "@/shared/lib/api-client";
import { useToast } from "@/shared/toast/useToast";

// Downloads a signed receipt as a PDF (parcel pickup, found item return):
// the API builds it (a few seconds), so the button shows it is working
// until the file arrives.
export function ReceiptPdfButton({
  path,
  fallbackName,
}: {
  /** The BFF path of the file (e.g. /parcels/<id>/receipt). */
  path: string;
  /** The file name when the response has none. */
  fallbackName: string;
}) {
  const { showError } = useToast();
  const [loading, setLoading] = useState(false);

  async function run() {
    setLoading(true);
    try {
      const { blob, fileName } = await apiDownload(path);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName ?? fallbackName;
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
      onClick={() => void run()}
    >
      {loading ? "Gerando o PDF…" : "Baixar comprovante em PDF"}
    </Button>
  );
}
