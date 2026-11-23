"use client";

import { useState } from "react";
import { FileDown } from "lucide-react";
import { Button } from "@/design-system";
import { ApiClientError, apiDownload } from "@/shared/lib/api-client";
import { saveFile } from "@/shared/lib/save-file";
import { useToast } from "@/shared/toast/useToast";

// Downloads a signed receipt as a PDF (parcel pickup, found item return):
// the API builds it (a few seconds), so the button shows it is working
// until the file arrives. "iconOnly" makes it a square icon button (the
// label as its name and tooltip), for the actions of a list row.
export function ReceiptPdfButton({
  path,
  fallbackName,
  label = "Baixar comprovante em PDF",
  variant = "brand",
  className,
  iconOnly = false,
}: {
  /** The BFF path of the file (e.g. /parcels/<id>/receipt). */
  path: string;
  /** The file name when the response has none. */
  fallbackName: string;
  /** The button text (default: the receipt). */
  label?: string;
  variant?: "brand" | "secondary";
  className?: string;
  iconOnly?: boolean;
}) {
  const { showError } = useToast();
  const [loading, setLoading] = useState(false);

  async function run() {
    setLoading(true);
    try {
      const { blob, fileName } = await apiDownload(path);
      saveFile(blob, fileName ?? fallbackName);
    } catch (cause) {
      showError(
        cause instanceof ApiClientError
          ? cause.message
          : "Não foi possível baixar o PDF.",
      );
    } finally {
      setLoading(false);
    }
  }

  if (iconOnly) {
    return (
      <Button
        variant={variant}
        size="icon"
        className={className}
        loading={loading}
        icon={<FileDown className="size-4" />}
        aria-label={loading ? "Gerando o PDF…" : label}
        title={label}
        onClick={() => void run()}
      />
    );
  }

  return (
    <Button
      variant={variant}
      className={className}
      loading={loading}
      icon={<FileDown className="size-4" />}
      onClick={() => void run()}
    >
      {loading ? "Gerando o PDF…" : label}
    </Button>
  );
}
