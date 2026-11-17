import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarClock, ClipboardList, Clock } from "lucide-react";
import { Card, CardBody, CardHeader } from "@/design-system";
import { AccessDenied } from "@/features/access/components/AccessDenied";
import { SpaceHero } from "@/features/spaces/components/SpaceHero";
import { SpacePhotoGallery } from "@/features/spaces/components/SpacePhotoGallery";
import { SpaceManageActions } from "@/features/spaces/components/SpaceManageActions";
import { describeRules, WEEKDAYS } from "@/features/spaces/model/space-labels";
import { authed, getSessionUser } from "@/server/auth/current-user";
import { loadSpace } from "@/server/loaders/load-space";
import { bookingsService } from "@/server/services/bookings.service";
import { SpaceBlocksCard } from "@/features/bookings/components/SpaceBlocksCard";
import { can } from "@/shared/lib/access";

export const metadata: Metadata = { title: "Espaço" };

export default async function SpacePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getSessionUser();
  // Checked here too (the layout's check doesn't stop this page rendering).
  if (!can(user, "SPACES_MANAGE")) return <AccessDenied />;
  const space = await loadSpace((await params).id);
  if (!space) notFound();
  const blocks = can(user, "BOOKINGS_MANAGE")
    ? await authed((token) => bookingsService.blocks(token, space.id))
    : [];

  const manager = can(user, "SPACES_MANAGE");
  const hours = new Map(
    space.rules.openingHours.map((day) => [day.weekday, day]),
  );

  return (
    <div className="space-y-6">
      <Link
        href="/gestao/reservas/espacos"
        className="inline-flex items-center gap-1 text-sm text-muted hover:text-fg"
      >
        <ArrowLeft className="size-4" /> Espaços
      </Link>

      <SpaceHero space={space} />

      <SpacePhotoGallery photos={space.photos} name={space.name} />

      {manager && (
        <Card>
          <CardHeader
            title="Gestão do espaço"
            description={
              space.active
                ? "Visível para os moradores."
                : "Inativo: os moradores não veem este espaço."
            }
            action={<SpaceManageActions space={space} />}
          />
        </Card>
      )}

      {space.description && (
        <p className="text-[15px] whitespace-pre-line text-muted">
          {space.description}
        </p>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader
            title="Horário de funcionamento"
            action={<Clock aria-hidden className="size-5 text-soft" />}
          />
          <CardBody className="pt-0">
            <dl className="divide-y divide-border text-sm">
              {WEEKDAYS.map((day) => {
                const open = hours.get(day.value);
                return (
                  <div
                    key={day.value}
                    className="flex justify-between gap-4 py-2"
                  >
                    <dt className="text-muted">{day.long}</dt>
                    <dd className={open ? "font-medium text-fg" : "text-soft"}>
                      {open
                        ? `${open.opensAt} às ${open.closesAt === "24:00" ? "24h" : open.closesAt}`
                        : "Fechado"}
                    </dd>
                  </div>
                );
              })}
            </dl>
          </CardBody>
        </Card>

        <Card>
          <CardHeader
            title="Como reservar"
            action={<CalendarClock aria-hidden className="size-5 text-soft" />}
          />
          <CardBody className="pt-0">
            <ul className="space-y-2 text-sm text-fg">
              {describeRules(space.rules).map((line) => (
                <li key={line} className="flex gap-2">
                  <span
                    aria-hidden
                    className="mt-1.5 size-1.5 shrink-0 rounded-full bg-brand"
                  />
                  {line}
                </li>
              ))}
            </ul>
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardHeader
          title="Regras de uso"
          action={<ClipboardList aria-hidden className="size-5 text-soft" />}
        />
        <CardBody className="pt-0">
          <p className="text-sm whitespace-pre-line text-fg">
            {space.usageRules ?? "Nenhuma regra de uso informada."}
          </p>
        </CardBody>
      </Card>

      {can(user, "BOOKINGS_MANAGE") && (
        <SpaceBlocksCard spaceId={space.id} blocks={blocks} manager />
      )}
    </div>
  );
}
