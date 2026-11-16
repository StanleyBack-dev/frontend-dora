import type { ReactNode } from "react";
import { cn } from "@/design-system/utils/cn";

// The footer of a page form: cancel and submit. On phones the two share
// one row at equal widths; from `sm` up they sit at the right.
export function FormActions({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "grid auto-cols-fr grid-flow-col gap-2 sm:flex sm:justify-end",
        "max-sm:[&>*]:min-w-0 max-sm:[&>*]:px-3",
        className,
      )}
    >
      {children}
    </div>
  );
}
