// An event ticket's link and code. The QR carries the link (a phone camera
// opens the ticket page; the gate's reader finds the code in it). Codes are
// 10 characters, a booking guest's invite 8: the gate tells them apart.

export const TICKET_CODE_LENGTH = 10;

/** The ticket page of a person, on this site. */
export const ticketUrl = (code: string): string =>
  `${window.location.origin}/ingresso/${code}`;

/** The message that goes with one person's ticket. */
export function ticketMessage(
  person: { name: string; ticketCode: string },
  eventTitle: string,
): string {
  return [
    `Olá, ${person.name.split(" ")[0]}! Seu ingresso para ${eventTitle}.`,
    `Mostre este QR na portaria: ${ticketUrl(person.ticketCode)}`,
  ].join("\n");
}

/** All the tickets of an order in one message (to send to a group). */
export function allTicketsMessage(
  people: { name: string; ticketCode: string }[],
  eventTitle: string,
): string {
  return [
    `Ingressos: ${eventTitle}`,
    "Cada pessoa mostra o próprio QR na portaria:",
    ...people.map(
      (person) => `• ${person.name}: ${ticketUrl(person.ticketCode)}`,
    ),
  ].join("\n");
}

/**
 * What the gate typed or read, when it is an event ticket: the code inside
 * a ticket link, or 10 characters typed. Null: not a ticket (an invite).
 */
export function ticketCodeFrom(text: string): string | null {
  const link = /\/ingresso\/([A-Za-z0-9-]+)/i.exec(text);
  if (link) return link[1].toUpperCase();
  const code = text.toUpperCase().replace(/[\s.·-]/g, "");
  return code.length === TICKET_CODE_LENGTH ? code : null;
}
