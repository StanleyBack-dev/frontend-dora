import QRCode from "qrcode";

/**
 * The invite's QR code as SVG markup. It carries the invite's link, so a
 * phone camera opens the page and the gate's reader finds the code in it.
 */
export function inviteQrSvg(url: string): Promise<string> {
  return QRCode.toString(url, {
    type: "svg",
    // M: survives a cracked screen or a glare without growing too dense.
    errorCorrectionLevel: "M",
    margin: 1,
    color: { dark: "#111111", light: "#ffffff" },
  });
}

/** The invite code inside what a reader scanned (a link or the code). */
export function codeFromScan(text: string): string {
  const match = /\/convite\/([A-Za-z0-9-]+)/.exec(text);
  return (match?.[1] ?? text).trim().toUpperCase();
}
