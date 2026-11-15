import type { Metadata } from "next";
import { CalendarDays, CircleCheck, MapPin, UserRound } from "lucide-react";
import { Alert, Badge } from "@/design-system";
import { AuthLayout } from "@/features/auth/components/AuthLayout";
import { InviteCode } from "@/features/bookings/components/InviteCode";
import { formatSlot } from "@/features/bookings/model/booking-labels";
import { inviteQrSvg } from "@/features/bookings/model/invite-qr";
import { bookingsService } from "@/server/services/bookings.service";
import { formatLongDay } from "@/shared/lib/datetime";
import { requestOrigin } from "@/server/http/request-origin";

const SHARE_TITLE = "Convite · Dora";
const SHARE_DESCRIPTION = "Mostre este convite na portaria do condomínio.";

export const metadata: Metadata = {
  title: "Convite",
  robots: { index: false },
  // Shared over WhatsApp: its own preview, without personal data.
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: "Dora",
    title: SHARE_TITLE,
    description: SHARE_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: SHARE_TITLE,
    description: SHARE_DESCRIPTION,
  },
};

// A guest's invite: for whom, where, when, and the code the gate checks. No
// account needed; the code is the key (the API limits how many a
// connection opens).
export default async function GuestInvitePage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const invite = /^[A-Za-z0-9-]{4,20}$/.test(code)
    ? await bookingsService.invite(code)
    : null;

  if (!invite) {
    return (
      <AuthLayout>
        <div className="space-y-4 text-center">
          <h1 className="text-2xl font-extrabold text-fg">
            Convite não encontrado
          </h1>
          <p className="text-sm text-muted">
            Confira o link que você recebeu ou peça um novo a quem convidou
            você.
          </p>
        </div>
      </AuthLayout>
    );
  }

  const valid = invite.status === "VALID";
  const qrSvg = await inviteQrSvg(
    `${await requestOrigin()}/convite/${invite.code}`,
  );
  return (
    <AuthLayout>
      <div className="space-y-5">
        <div className="text-center">
          <p className="text-xs font-bold tracking-[0.14em] text-brand-ink uppercase">
            Convite
          </p>
          <h1 className="mt-1 text-2xl font-extrabold text-fg">
            {invite.guestName}
          </h1>
          <p className="mt-1 text-sm text-muted">
            a convite de {invite.hostFirstName}
          </p>
          <div className="mt-3 flex justify-center">
            {invite.checkedIn ? (
              <Badge tone="success">Entrada registrada</Badge>
            ) : valid ? (
              <Badge tone="brand">Válido</Badge>
            ) : invite.status === "CANCELLED" ? (
              <Badge tone="danger">Cancelado</Badge>
            ) : (
              <Badge tone="neutral">Encerrado</Badge>
            )}
          </div>
        </div>

        <InviteCode code={invite.code} qrSvg={qrSvg} muted={!valid} />

        <dl className="divide-y divide-border rounded-xl border border-border text-sm">
          <div className="flex items-start gap-3 px-4 py-3">
            <MapPin aria-hidden className="mt-0.5 size-4 shrink-0 text-soft" />
            <div>
              <dt className="sr-only">Onde</dt>
              <dd className="font-medium text-fg">{invite.spaceName}</dd>
              <dd className="text-muted">{invite.condominiumName}</dd>
            </div>
          </div>
          <div className="flex items-start gap-3 px-4 py-3">
            <CalendarDays
              aria-hidden
              className="mt-0.5 size-4 shrink-0 text-soft"
            />
            <div>
              <dt className="sr-only">Quando</dt>
              <dd className="font-medium text-fg capitalize">
                {formatLongDay(invite.startsAt)}
              </dd>
              <dd className="text-muted">
                {formatSlot(invite.startsAt, invite.endsAt)}
              </dd>
            </div>
          </div>
          <div className="flex items-start gap-3 px-4 py-3">
            <UserRound
              aria-hidden
              className="mt-0.5 size-4 shrink-0 text-soft"
            />
            <div>
              <dt className="sr-only">Quem convidou</dt>
              <dd className="text-fg">{invite.hostFirstName}</dd>
            </div>
          </div>
        </dl>

        {invite.checkedIn ? (
          <Alert tone="success">
            <CircleCheck aria-hidden className="mr-1 inline size-4" />A portaria
            já registrou a sua entrada.
          </Alert>
        ) : valid ? (
          <p className="text-center text-sm text-muted">
            Na portaria, mostre este QR ou diga o código. A entrada é liberada a
            partir de 3 horas antes do horário.
          </p>
        ) : (
          <Alert tone={invite.status === "CANCELLED" ? "danger" : "info"}>
            {invite.status === "CANCELLED"
              ? "A reserva foi cancelada: este convite não vale mais."
              : "A reserva já terminou: este convite não vale mais."}
          </Alert>
        )}
      </div>
    </AuthLayout>
  );
}
