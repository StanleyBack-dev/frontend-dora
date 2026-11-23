import { cn } from "@/design-system/utils/cn";

export type Fact = { label: string; value: React.ReactNode };

/**
 * Label / value pairs in two columns (one on a phone); facts without a
 * value are left out.
 */
export function FactList({
  facts,
  className,
}: {
  facts: { label: string; value: React.ReactNode | null | undefined }[];
  className?: string;
}) {
  const shown = facts.filter(
    (fact): fact is Fact =>
      fact.value !== null && fact.value !== undefined && fact.value !== "",
  );
  return (
    <dl
      className={cn("grid gap-x-4 gap-y-3 text-sm sm:grid-cols-2", className)}
    >
      {shown.map((fact) => (
        <div key={fact.label} className="min-w-0">
          <dt className="text-xs text-soft">{fact.label}</dt>
          <dd className="break-words text-fg">{fact.value}</dd>
        </div>
      ))}
    </dl>
  );
}
