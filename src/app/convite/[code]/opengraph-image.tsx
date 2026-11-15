import { ImageResponse } from "next/og";
import {
  SHARE_CARD_SIZE,
  ShareCard,
  type ShareTicket,
} from "@/features/layout/components/ShareCard";
import { brandLogoSrc } from "@/features/layout/model/brand-logo";
import { formatSlot } from "@/features/bookings/model/booking-labels";
import { bookingsService } from "@/server/services/bookings.service";
import { formatLongDay } from "@/shared/lib/datetime";

// Cover of a guest's invite, the link the host sends over WhatsApp: where
// and when, as on the invite page. No guest name or document: the preview
// may be forwarded. Unknown codes get a plain invite ticket.
export const alt = "Convite · Dora";
export const size = SHARE_CARD_SIZE;
export const contentType = "image/png";

const GENERIC: ShareTicket = {
  label: "Convite",
  title: "Entrada na portaria",
  lines: ["QR code no link do convite", "Válido no dia da reserva"],
};

async function inviteTicket(code: string): Promise<ShareTicket> {
  if (!/^[A-Za-z0-9-]{4,20}$/.test(code)) return GENERIC;
  const invite = await bookingsService.invite(code).catch(() => null);
  if (!invite) return GENERIC;
  return {
    label: invite.status === "VALID" ? "Convite válido" : "Convite",
    tone: invite.status === "VALID" ? "success" : "brand",
    title: invite.spaceName,
    lines: [
      formatLongDay(invite.startsAt),
      formatSlot(invite.startsAt, invite.endsAt),
      invite.condominiumName,
    ],
  };
}

export default async function GuestInviteOpengraphImage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  return new ImageResponse(
    <ShareCard
      headline="Você tem um convite!"
      note="Abra o convite e mostre o QR code na portaria."
      logoSrc={await brandLogoSrc()}
      ticket={await inviteTicket(code)}
    />,
    size,
  );
}
