import Link from "next/link";
import type { ReactNode } from "react";
import {
  buttonClasses,
  type ButtonVariant,
} from "@/design-system/components/Button";
import { cn } from "@/design-system/utils/cn";

// A square link with only an icon, sized for a phone card's header (next
// to the title). The label is read aloud and shown on hover.
export function IconLink({
  href,
  label,
  icon,
  variant = "secondary",
}: {
  href: string;
  label: string;
  icon: ReactNode;
  variant?: ButtonVariant;
}) {
  return (
    <Link
      href={href}
      aria-label={label}
      title={label}
      className={cn(
        buttonClasses(variant, "icon"),
        "[&>svg]:size-4 [&>svg]:shrink-0",
      )}
    >
      {icon}
    </Link>
  );
}
