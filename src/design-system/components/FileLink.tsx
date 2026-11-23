import { FileText } from "lucide-react";

/** A link that opens an attached file (an invoice, a proof) in a new tab. */
export function FileLink({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center gap-1 text-xs font-semibold text-brand-ink underline"
    >
      <FileText aria-hidden className="size-3.5" />
      {label}
    </a>
  );
}
