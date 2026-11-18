import type { Metadata } from "next";
import Link from "next/link";
import { CalendarDays, Plus } from "lucide-react";
import {
  buttonClasses,
  Card,
  EmptyState,
  PageHeader,
  Pagination,
  SegmentedNav,
} from "@/design-system";
import { BookingCard } from "@/features/bookings/components/BookingCard";
import { authed } from "@/server/auth/current-user";
import { bookingsService } from "@/server/services/bookings.service";
import { spacesService } from "@/server/services/spaces.service";
import { photosBySpace } from "@/features/spaces/model/space-photos";
import { requestTime } from "@/server/request-time";
import {
  firstParam,
  pageParam,
  type RawSearchParams,
} from "@/shared/lib/search-params";

export const metadata: Metadata = { title: "Reservas" };

const PAGE_SIZE = 10;

export default async function MyBookingsPage({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>;
}) {
  const params = await searchParams;
  const past = firstParam(params, "periodo") === "passadas";
  const page = pageParam(params);

  const [bookings, spaces] = await authed((token) =>
    Promise.all([
      bookingsService.mine(token, past ? "PAST" : "UPCOMING", {
        page,
        limit: PAGE_SIZE,
      }),
      // Every space (inactive too): a past booking keeps its photos.
      spacesService.list(token, true),
    ]),
  );
  const href = (target: number) =>
    `/reservas?${past ? "periodo=passadas&" : ""}page=${target}`;
  const photos = photosBySpace(spaces);
  // One clock for the whole list (this request's time).
  const now = (await requestTime()).getTime();

  return (
    <>
      <PageHeader
        title="Reservas"
        description="Suas reservas de quadras, salão e outros espaços."
        actions={
          <Link href="/reservas/nova" className={buttonClasses("brand")}>
            <Plus aria-hidden className="mr-1.5 size-4" />
            Nova reserva
          </Link>
        }
      />
      <SegmentedNav
        label="Período"
        className="mb-4"
        items={[
          { label: "Próximas", href: "/reservas", active: !past },
          {
            label: "Passadas",
            href: "/reservas?periodo=passadas",
            active: past,
          },
        ]}
      />

      {bookings.items.length === 0 ? (
        <Card>
          <EmptyState
            icon={<CalendarDays className="size-5" />}
            title={past ? "Nenhuma reserva passada" : "Nenhuma reserva marcada"}
            description={
              past
                ? "As reservas que já aconteceram aparecem aqui."
                : "Escolha um espaço e um horário livre para reservar."
            }
            action={
              past ? undefined : (
                <Link href="/reservas/nova" className={buttonClasses()}>
                  Fazer uma reserva
                </Link>
              )
            }
          />
        </Card>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {bookings.items.map((booking) => (
              <BookingCard
                key={booking.id}
                booking={booking}
                now={now}
                photos={photos[booking.spaceId]}
              />
            ))}
          </div>
          {bookings.totalPages > 1 && (
            <Card>
              <Pagination
                page={bookings.page}
                totalPages={bookings.totalPages}
                total={bookings.total}
                pageSize={PAGE_SIZE}
                hrefFor={href}
              />
            </Card>
          )}
        </div>
      )}
    </>
  );
}
