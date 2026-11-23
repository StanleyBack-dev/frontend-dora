import type { ReactNode } from "react";
import Link from "next/link";
import { cn } from "@/design-system";

/**
 * A purchase's name in a table row, with its codes under it. The width is
 * capped so a long name is cut with "…" (whole on hover) instead of
 * stretching the table into a horizontal scroll.
 */
export function RowTitle({
  title,
  href,
  meta,
  mono = true,
}: {
  title: string;
  href?: string;
  meta: ReactNode;
  /** The codes in a monospaced font (default). */
  mono?: boolean;
}) {
  const name = "truncate font-medium text-fg";
  return (
    <span className="flex max-w-[12rem] min-w-0 flex-col lg:max-w-[18rem]">
      {href ? (
        <Link href={href} title={title} className={cn(name, "hover:underline")}>
          {title}
        </Link>
      ) : (
        <span title={title} className={name}>
          {title}
        </span>
      )}
      <span className={cn("truncate text-xs text-soft", mono && "font-mono")}>
        {meta}
      </span>
    </span>
  );
}
