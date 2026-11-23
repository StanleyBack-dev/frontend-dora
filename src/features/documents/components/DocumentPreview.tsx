import type { ReactNode } from "react";
import { ExternalLink, FileText } from "lucide-react";
import { buttonClasses } from "@/design-system";

// A document shown large: an image whole (a click opens it in a new tab), or
// a PDF as a card with its icon and an "Abrir PDF" link (the pages' CSP
// doesn't let a PDF be framed). Below it, centered, the name and the actions given
// (replace, remove).
export function DocumentPreview({
  url,
  pdf,
  name,
  children,
}: {
  /** The image or PDF (a signed address, or a local blob). */
  url: string;
  pdf: boolean;
  name: string;
  /** Actions shown beside the name. */
  children?: ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-surface">
      {pdf ? (
        <div className="flex min-h-56 flex-col items-center justify-center gap-3 bg-surface-muted/60 px-4 py-8 text-center">
          <span className="grid size-16 place-items-center rounded-2xl bg-danger-soft text-danger">
            <FileText aria-hidden className="size-8" />
          </span>
          <span className="max-w-full text-sm font-medium break-all text-fg">
            {name}
          </span>
          <a
            href={url}
            target="_blank"
            rel="noreferrer"
            className={buttonClasses("secondary", "sm")}
          >
            <ExternalLink aria-hidden className="mr-1.5 size-4" />
            Abrir PDF
          </a>
        </div>
      ) : (
        <a
          href={url}
          target="_blank"
          rel="noreferrer"
          title="Abrir em tamanho real"
          className="block bg-white"
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- signed or local address */}
          <img
            src={url}
            alt={`Documento: ${name}`}
            className="mx-auto max-h-[28rem] min-h-56 w-full object-contain"
          />
        </a>
      )}
      <div className="flex flex-col items-center gap-2 border-t border-border px-3 py-3 text-center">
        <span className="flex max-w-full min-w-0 items-center gap-2 text-sm text-muted">
          <FileText aria-hidden className="size-4 shrink-0" />
          <span className="truncate">{name}</span>
        </span>
        {children && (
          <span className="flex flex-wrap justify-center gap-2">
            {children}
          </span>
        )}
      </div>
    </div>
  );
}
