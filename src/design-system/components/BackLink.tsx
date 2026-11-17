import Link from "next/link";
import { ArrowLeft } from "lucide-react";

// "← Somewhere" above a page's header: back to the page it belongs to.
export function BackLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="mb-4 inline-flex items-center gap-1 text-sm text-muted hover:text-fg"
    >
      <ArrowLeft aria-hidden className="size-4" /> {label}
    </Link>
  );
}
