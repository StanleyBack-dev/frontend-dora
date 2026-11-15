// A static PIX code (BR Code, the "copia e cola" every bank app reads), as
// defined by the Banco Central: EMV fields "id + length + value", ending
// with a CRC16 of the whole text. No amount: whoever pays chooses it.

export type PixReceiver = {
  /** The PIX key: e-mail, CPF/CNPJ (digits), phone (+55…) or random key. */
  key: string;
  /** Receiver's name as the bank shows it (up to 25 characters). */
  name: string;
  /** Receiver's city (up to 15 characters). */
  city: string;
  /** Short message shown by some banks (optional). */
  description?: string | null;
};

/** Plain ASCII, upper case: what the BR Code allows in name and city. */
const plain = (value: string, max: number) =>
  value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^A-Za-z0-9 .-]/g, "")
    .trim()
    .toUpperCase()
    .slice(0, max);

/** One field: two-digit id, two-digit length, value. */
const field = (id: string, value: string) =>
  `${id}${String(value.length).padStart(2, "0")}${value}`;

/** CRC16-CCITT (polynomial 0x1021, initial 0xFFFF), as the BR Code asks. */
export function crc16(text: string): string {
  let crc = 0xffff;
  for (let i = 0; i < text.length; i += 1) {
    crc ^= text.charCodeAt(i) << 8;
    for (let bit = 0; bit < 8; bit += 1) {
      crc = crc & 0x8000 ? ((crc << 1) ^ 0x1021) & 0xffff : (crc << 1) & 0xffff;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, "0");
}

/** The PIX "copia e cola" text (also what the QR code carries). */
export function pixPayload(receiver: PixReceiver): string {
  const description = receiver.description
    ? plain(receiver.description, 40)
    : "";
  const account =
    field("00", "br.gov.bcb.pix") +
    field("01", receiver.key.trim()) +
    (description ? field("02", description) : "");
  const body =
    field("00", "01") +
    field("26", account) +
    field("52", "0000") +
    field("53", "986") +
    field("58", "BR") +
    field("59", plain(receiver.name, 25)) +
    field("60", plain(receiver.city, 15)) +
    field("62", field("05", "***")) +
    "6304";
  return body + crc16(body);
}
