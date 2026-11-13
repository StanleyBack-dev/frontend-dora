import { cn } from "@/design-system";
import { BRAND_COLORS } from "@/features/layout/model/brand-mark";

// The Dora mark (orange tile + black "d"), inline so it never waits for a
// download and stays sharp at any size. The size comes from className.
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      role="img"
      aria-label="Dora"
      className={cn("shrink-0", className)}
    >
      <rect width="64" height="64" rx="16" fill={BRAND_COLORS.orange} />
      <circle
        cx="31"
        cy="38"
        r="11"
        fill="none"
        stroke={BRAND_COLORS.black}
        strokeWidth="7"
      />
      <rect
        x="40"
        y="12"
        width="7"
        height="40.5"
        rx="3.5"
        fill={BRAND_COLORS.black}
      />
    </svg>
  );
}
