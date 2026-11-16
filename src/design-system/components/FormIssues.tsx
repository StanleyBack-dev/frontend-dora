import { AlertTriangle, XCircle } from "lucide-react";
import { cn } from "@/design-system/utils/cn";

// The top-of-form section that lists what is still missing and the last
// error of the submit, so messages never crowd the fields or the footer.
// Renders nothing when there is nothing to say.
export function FormIssues({
  missing = [],
  error,
  title = "Falta preencher",
  className,
}: {
  /** Fields still to fill (a warning, the form just isn't ready). */
  missing?: string[];
  /** The error of the last submit (from the API). */
  error?: string | null;
  title?: string;
  className?: string;
}) {
  if (missing.length === 0 && !error) return null;

  return (
    <section
      aria-live="polite"
      className={cn(
        "space-y-3 rounded-2xl border px-4 py-3.5 text-[13px] sm:px-5",
        error
          ? "border-danger-border bg-danger-soft"
          : "border-warning-border bg-warning-soft",
        className,
      )}
    >
      {error && (
        <p role="alert" className="flex gap-2.5 font-medium text-danger">
          <XCircle aria-hidden className="mt-0.5 size-4 shrink-0" />
          {error}
        </p>
      )}
      {missing.length > 0 && (
        <div className="flex gap-2.5 text-warning">
          <AlertTriangle aria-hidden className="mt-0.5 size-4 shrink-0" />
          <div className="min-w-0">
            <p className="font-semibold">{title}</p>
            <ul className="mt-1 list-disc space-y-0.5 pl-4 opacity-90">
              {missing.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </section>
  );
}
