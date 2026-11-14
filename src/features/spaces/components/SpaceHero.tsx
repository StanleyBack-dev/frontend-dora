import { Users } from "lucide-react";
import { Badge } from "@/design-system";
import { SPACE_KINDS } from "@/features/spaces/model/space-labels";
import type { Space } from "@/shared/contracts/spaces";

// The dark header of a space: kind, name and its badges. Used by the space
// page (Espaços) and by the booking page (Reservas).
export function SpaceHero({
  space,
  eyebrow,
}: {
  space: Pick<Space, "name" | "kind" | "active" | "capacity">;
  /** Text above the name (default: the kind, e.g. "Quadra"). */
  eyebrow?: string;
}) {
  const { label, icon: Icon } = SPACE_KINDS[space.kind];
  return (
    <section className="relative overflow-hidden rounded-[1.75rem] bg-chrome px-6 py-7 text-chrome-fg sm:px-8">
      <span
        aria-hidden
        className="absolute -top-20 -right-12 size-56 rounded-full bg-brand"
      />
      <div className="relative flex items-start gap-4">
        <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-brand text-brand-fg">
          <Icon aria-hidden className="size-7" />
        </span>
        <div className="min-w-0">
          <p className="text-xs font-bold tracking-wide text-chrome-muted uppercase">
            {eyebrow ?? label}
          </p>
          <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
            {space.name}
          </h1>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {!space.active && <Badge tone="neutral">Inativo</Badge>}
            {space.capacity && (
              <Badge tone="brand">
                <Users aria-hidden className="mr-1 size-3" />
                Até {space.capacity} pessoas
              </Badge>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
