import Link from "next/link";
import { ArrowUpRight, Clock, ShieldCheck, Users } from "lucide-react";
import { Badge, Card } from "@/design-system";
import { SpacePhotoCarousel } from "@/features/spaces/components/SpacePhotoCarousel";
import {
  formatDuration,
  SPACE_KINDS,
  summarizeOpeningHours,
} from "@/features/spaces/model/space-labels";
import type { Space } from "@/shared/contracts/spaces";

// A space in a list: its photos, what it is, when it opens and how long a
// booking is. The same card serves the Espaços catalog and the start of a
// booking. The whole card opens the space (a link stretched over it); the
// photo arrows sit above that link, so flipping photos doesn't open it.
export function SpaceCard({
  space,
  href = `/espacos/${space.id}`,
  cta = "Ver detalhes",
}: {
  space: Space;
  href?: string;
  /** The call to action at the bottom ("Ver detalhes", "Reservar"). */
  cta?: string;
}) {
  const { label, icon: Icon } = SPACE_KINDS[space.kind];
  const hours = summarizeOpeningHours(space.rules.openingHours);
  return (
    <div className="group relative h-full">
      <Card className="relative flex h-full flex-col gap-4 overflow-hidden p-5 transition-all group-hover:-translate-y-0.5 group-hover:border-brand-border">
        {space.photos.length > 0 && (
          <SpacePhotoCarousel
            photos={space.photos}
            name={space.name}
            className="-mx-5 -mt-5 aspect-[16/9]"
          />
        )}
        <div className="flex items-start justify-between gap-3">
          <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-brand text-brand-fg">
            <Icon aria-hidden className="size-6" />
          </span>
          <div className="flex flex-wrap justify-end gap-1.5">
            {!space.active && <Badge tone="neutral">Inativo</Badge>}
            {space.rules.requiresApproval && (
              <Badge tone="info">
                <ShieldCheck aria-hidden className="mr-1 size-3" />
                Com aprovação
              </Badge>
            )}
          </div>
        </div>
        <div className="min-w-0">
          <p className="text-[11px] font-bold tracking-wide text-soft uppercase">
            {label}
          </p>
          <h2 className="truncate text-lg font-bold text-fg">
            {/* Stretched over the whole card (the ::after layer). */}
            <Link
              href={href}
              className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none"
            >
              {space.name}
            </Link>
          </h2>
          {space.description && (
            <p className="mt-1 line-clamp-2 text-[13px] text-muted">
              {space.description}
            </p>
          )}
        </div>
        <ul className="mt-auto space-y-1.5 text-[13px] text-muted">
          <li className="flex items-start gap-2">
            <Clock aria-hidden className="mt-0.5 size-4 shrink-0 text-soft" />
            <span>
              {hours[0]}
              {hours.length > 1 && (
                <span className="text-soft"> e mais {hours.length - 1}</span>
              )}
            </span>
          </li>
          <li className="flex items-center gap-2">
            <Users aria-hidden className="size-4 shrink-0 text-soft" />
            {space.capacity
              ? `Até ${space.capacity} pessoas`
              : "Capacidade não informada"}
            <span className="text-soft">
              · reservas de {formatDuration(space.rules.slotMinutes)}
            </span>
          </li>
        </ul>
        <span className="flex items-center gap-1 text-sm font-semibold text-brand-ink">
          {cta}
          <ArrowUpRight aria-hidden className="size-4" />
        </span>
      </Card>
    </div>
  );
}
