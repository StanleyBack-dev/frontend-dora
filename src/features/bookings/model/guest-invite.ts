import type { BookingGuest } from "@/shared/contracts/bookings";

/** The invite page of a guest, on this site. */
export const inviteUrl = (code: string): string =>
  `${window.location.origin}/convite/${code}`;

/** WhatsApp with the message ready: to the guest's number, or pick a chat. */
export function whatsappLink(text: string, phone?: string | null): string {
  const to = phone ? `55${phone}` : "";
  return `https://wa.me/${to}?text=${encodeURIComponent(text)}`;
}

/** The message that goes with one guest's invite. */
export function inviteMessage(
  guest: Pick<BookingGuest, "name" | "code">,
  event: { spaceName: string; period: string },
): string {
  return [
    `Olá, ${guest.name.split(" ")[0]}! Você está na lista de convidados.`,
    `${event.spaceName} · ${event.period}`,
    `Mostre este convite na portaria: ${inviteUrl(guest.code)}`,
  ].join("\n");
}

/** All the invites in one message (to send to a group). */
export function allInvitesMessage(
  guests: Pick<BookingGuest, "name" | "code">[],
  event: { spaceName: string; period: string },
): string {
  return [
    `Convites: ${event.spaceName} · ${event.period}`,
    "Cada convidado mostra o próprio convite na portaria:",
    ...guests.map((guest) => `• ${guest.name}: ${inviteUrl(guest.code)}`),
  ].join("\n");
}
