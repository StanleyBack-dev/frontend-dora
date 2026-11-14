import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarClock, ClipboardList, Clock } from "lucide-react";
import { Card, CardBody, CardHeader } from "@/design-system";
import { BookingCalendar } from "@/features/bookings/components/BookingCalendar";
import { SpaceBlocksCard } from "@/features/bookings/components/SpaceBlocksCard";
import { SpaceHero } from "@/features/spaces/components/SpaceHero";
import { SpacePhotoGallery } from "@/features/spaces/components/SpacePhotoGallery";
import {
  describeRules,
  summarizeOpeningHours,
} from "@/features/spaces/model/space-labels";
import { authed, getSessionUser } from "@/server/auth/current-user";
import { loadSpace } from "@/server/loaders/load-space";
import { requestTime } from "@/server/request-time";
import { bookingsService } from "@/server/services/bookings.service";
import { can } from "@/shared/lib/access";

export const metadata: Metadata = { title: "Reservar" };

// Step 2 of a booking: the space's calendar and everything a resident needs
// to book it (the Espaços menu is only for managers): how booking works
// here, opening hours, house rules and the periods it is closed.
export default async function BookSpacePage({
  params,
}: {
  params: Promise<{ spaceId: string }>;
}) {
  const user = await getSessionUser();
  const space = await loadSpace((await params).spaceId);
  // Inactive spaces take no bookings (managers reactivate them in Espaços).
  if (!space || !space.active) notFound();

  // Today's grid (the calendar loads other days itself) and the blocks.
  const today = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
  }).format(await requestTime());
  const [availability, blocks] = await authed((token) =>
    Promise.all([
      bookingsService.availability(token, space.id, today),
      bookingsService.blocks(token, space.id),
    ]),
  );

  return (
    <div className="space-y-6">
      <Link
        href="/reservas/nova"
        className="inline-flex items-center gap-1 text-sm text-muted hover:text-fg"
      >
        <ArrowLeft className="size-4" /> Escolher outro espaço
      </Link>

      <SpaceHero space={space} eyebrow="Nova reserva" />

      <SpacePhotoGallery photos={space.photos} name={space.name} />

      {space.description && (
        <p className="text-[15px] whitespace-pre-line text-muted">
          {space.description}
        </p>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
        <BookingCalendar
          space={{
            id: space.id,
            name: space.name,
            usageRules: space.usageRules,
            requiresApproval: space.rules.requiresApproval,
          }}
          initial={availability}
          canBook={can(user, "BOOKINGS_CREATE")}
        />

        <div className="space-y-6 self-start">
          <Card>
            <CardHeader
              title="Como reservar"
              action={
                <CalendarClock aria-hidden className="size-5 text-soft" />
              }
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

          <Card>
            <CardHeader
              title="Horário de funcionamento"
              action={<Clock aria-hidden className="size-5 text-soft" />}
            />
            <CardBody className="pt-0">
              <ul className="space-y-1 text-sm text-fg">
                {summarizeOpeningHours(space.rules.openingHours).map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </CardBody>
          </Card>

          {space.usageRules && (
            <Card>
              <CardHeader
                title="Regras de uso"
                action={
                  <ClipboardList aria-hidden className="size-5 text-soft" />
                }
              />
              <CardBody className="pt-0">
                <p className="text-sm whitespace-pre-line text-fg">
                  {space.usageRules}
                </p>
              </CardBody>
            </Card>
          )}
        </div>
      </div>

      <SpaceBlocksCard
        spaceId={space.id}
        blocks={blocks}
        manager={can(user, "BOOKINGS_MANAGE")}
      />
    </div>
  );
}
