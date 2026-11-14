import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  CalendarClock,
  CalendarPlus,
  ClipboardList,
  Clock,
  Users,
} from "lucide-react";
import { Badge, Button, Card, CardBody, CardHeader } from "@/design-system";
import { SpaceManageActions } from "@/features/spaces/components/SpaceManageActions";
import {
  describeRules,
  SPACE_KINDS,
  WEEKDAYS,
} from "@/features/spaces/model/space-labels";
import { loadSpace } from "@/app/(app)/espacos/[id]/load-space";
import { getSessionUser } from "@/server/auth/current-user";
import { can } from "@/shared/lib/access";

export const metadata: Metadata = { title: "Espaço" };

export default async function SpacePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getSessionUser();
  const space = await loadSpace((await params).id);
  if (!space) notFound();

  const manager = can(user, "SPACES_MANAGE");
  const { label, icon: Icon } = SPACE_KINDS[space.kind];
  const hours = new Map(
    space.rules.openingHours.map((day) => [day.weekday, day]),
  );

  return (
    <div className="space-y-6">
      <Link
        href="/espacos"
        className="inline-flex items-center gap-1 text-sm text-muted hover:text-fg"
      >
        <ArrowLeft className="size-4" /> Espaços
      </Link>

      <section className="relative overflow-hidden rounded-[1.75rem] bg-chrome px-6 py-7 text-chrome-fg sm:px-8">
        <span
          aria-hidden
          className="absolute -top-20 -right-12 size-56 rounded-full bg-brand"
        />
        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex items-start gap-4">
            <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-brand text-brand-fg">
              <Icon aria-hidden className="size-7" />
            </span>
            <div className="min-w-0">
              <p className="text-xs font-bold tracking-wide text-chrome-muted uppercase">
                {label}
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
          {/* Booking arrives in the next stage. */}
          <Button
            variant="brand"
            disabled
            icon={<CalendarPlus className="size-4" />}
            title="As reservas chegam em breve"
          >
            Reservar · em breve
          </Button>
        </div>
      </section>

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
    </div>
  );
}
