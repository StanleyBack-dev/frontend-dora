import { History } from "lucide-react";
import { cn } from "@/design-system/utils/cn";

// Above a form that came back from a draft: says so, and offers to start
// over (the draft is discarded).
export function DraftNotice({
  onDiscard,
  className,
}: {
  onDiscard: () => void;
  className?: string;
}) {
  return (
    <div
      role="status"
      className={cn(
        "flex flex-wrap items-center justify-between gap-2 rounded-xl border border-info-border bg-info-soft px-3 py-2 text-[13px] text-info",
        className,
      )}
    >
      <span className="flex items-center gap-2">
        <History aria-hidden className="size-4 shrink-0" />
        Rascunho recuperado: continue de onde parou.
      </span>
      <button
        type="button"
        onClick={onDiscard}
        className="font-semibold underline-offset-2 hover:underline"
      >
        Começar do zero
      </button>
    </div>
  );
}
