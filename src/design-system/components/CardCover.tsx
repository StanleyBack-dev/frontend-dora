import type { ReactNode } from "react";
import { cn } from "@/design-system/utils/cn";

// The cover of a card with no photo: the same place a photo would take (the
// size comes from className, e.g. "aspect-[16/9]"), a soft brand tint with
// the card's icon and a short label, so cards with and without photos line
// up in a grid.
export function CardCover({
  icon,
  label,
  className,
}: {
  icon: ReactNode;
  /** A short line under the icon (e.g. "Sem foto do local"). */
  label?: string;
  className?: string;
}) {
  return (
    <div
      aria-hidden
      className={cn(
        "relative flex flex-col items-center justify-center gap-2 overflow-hidden bg-gradient-to-br from-brand-soft via-surface-muted to-brand-soft",
        className,
      )}
    >
      <span className="absolute -top-10 -right-10 size-40 rounded-full bg-brand/10" />
      <span className="absolute -bottom-12 -left-8 size-32 rounded-full bg-brand/10" />
      <span className="relative grid size-14 place-items-center rounded-2xl bg-brand text-brand-fg shadow-sm [&_svg]:size-7">
        {icon}
      </span>
      {label && (
        <span className="relative text-xs font-semibold text-brand-ink">
          {label}
        </span>
      )}
    </div>
  );
}
