import type { ReactNode } from "react";
import { cn } from "@/design-system/utils/cn";

// The footer of a drawer: cancel and the main action. Centred on phones;
// from `sm` up they sit at the right.
export function DrawerActions({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-wrap justify-center gap-2 sm:justify-end",
        className,
      )}
    >
      {children}
    </div>
  );
}
