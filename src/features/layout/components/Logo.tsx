import { cn } from "@/design-system";
import { LogoMark } from "@/features/layout/components/LogoMark";

/** The "dora." wordmark: the name in lowercase with the orange dot. */
export function Wordmark({
  className,
  tone = "dark",
}: {
  className?: string;
  /** "dark" text for light backgrounds, "light" for the black chrome. */
  tone?: "dark" | "light";
}) {
  return (
    <span
      className={cn(
        "font-extrabold tracking-[-0.04em]",
        tone === "dark" ? "text-fg" : "text-chrome-fg",
        className,
      )}
    >
      dora<span className="text-brand">.</span>
    </span>
  );
}

// Mark + wordmark, for light backgrounds.
export function Logo({ size = "md" }: { size?: "md" | "lg" }) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <LogoMark className={size === "lg" ? "size-10" : "size-8"} />
      <Wordmark className={size === "lg" ? "text-2xl" : "text-xl"} />
    </span>
  );
}
