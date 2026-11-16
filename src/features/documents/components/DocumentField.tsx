"use client";

import { useEffect, useRef, useState } from "react";
import { FilePlus2, FileText, Loader2, X } from "lucide-react";
import { cn } from "@/design-system";
import {
  DOCUMENT_ACCEPT,
  DocumentFileError,
  prepareDocumentFile,
} from "@/shared/lib/document-file";
import { useToast } from "@/shared/toast/useToast";

/** A document picked in the browser, ready to send. */
export type PickedDocument = {
  /** Base64 (no data: prefix) for the API. */
  base64: string;
  name: string;
  pdf: boolean;
  /** Local preview of an image (revoked when replaced or removed). */
  previewUrl: string | null;
};

// A document (image or PDF) shown as a tile, like the space photos: the
// image itself, or the PDF's icon and name; an X removes it. Empty, a
// dashed tile picks one. The file is prepared (shrunk, checked) on pick.
export function DocumentField({
  label,
  hint,
  value,
  onChange,
}: {
  label: string;
  hint?: string;
  value: PickedDocument | null;
  onChange: (value: PickedDocument | null) => void;
}) {
  const { showError } = useToast();
  const input = useRef<HTMLInputElement>(null);
  const [preparing, setPreparing] = useState(false);

  // The local preview goes when the document changes or the field leaves.
  useEffect(() => {
    const url = value?.previewUrl;
    return () => {
      if (url) URL.revokeObjectURL(url);
    };
  }, [value?.previewUrl]);

  async function pick(file: File | undefined) {
    if (!file) return;
    setPreparing(true);
    try {
      const base64 = await prepareDocumentFile(file);
      const pdf = file.type === "application/pdf";
      onChange({
        base64,
        name: file.name,
        pdf,
        previewUrl: pdf ? null : URL.createObjectURL(file),
      });
    } catch (cause) {
      showError(
        cause instanceof DocumentFileError
          ? cause.message
          : "Não foi possível ler o arquivo.",
      );
    }
    setPreparing(false);
    if (input.current) input.current.value = "";
  }

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-fg">{label}</p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {value ? (
          <div className="relative aspect-[4/3] overflow-hidden rounded-xl border border-border bg-surface-muted">
            {value.previewUrl ? (
              // eslint-disable-next-line @next/next/no-img-element -- local preview
              <img
                src={value.previewUrl}
                alt={`Documento: ${value.name}`}
                className="size-full bg-white object-contain"
              />
            ) : (
              <span className="flex size-full flex-col items-center justify-center gap-1.5 px-3 text-center">
                <FileText aria-hidden className="size-8 text-danger" />
                <span className="line-clamp-2 text-xs font-medium break-all text-fg">
                  {value.name}
                </span>
              </span>
            )}
            <button
              type="button"
              onClick={() => onChange(null)}
              aria-label="Remover documento"
              className="absolute top-1.5 right-1.5 grid size-7 place-items-center rounded-full bg-fg/80 text-surface transition-colors hover:bg-danger"
            >
              <X aria-hidden className="size-4" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => input.current?.click()}
            disabled={preparing}
            className={cn(
              "flex aspect-[4/3] flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-border text-sm font-semibold text-muted transition-colors",
              "hover:border-brand hover:bg-brand-soft hover:text-fg disabled:cursor-wait",
            )}
          >
            {preparing ? (
              <Loader2 aria-hidden className="size-5 animate-spin" />
            ) : (
              <FilePlus2 aria-hidden className="size-5" />
            )}
            {preparing ? "Preparando…" : "Adicionar documento"}
          </button>
        )}
      </div>
      <input
        ref={input}
        type="file"
        accept={DOCUMENT_ACCEPT}
        className="hidden"
        onChange={(change) => pick(change.target.files?.[0])}
      />
      {hint && <p className="text-xs text-soft">{hint}</p>}
    </div>
  );
}
