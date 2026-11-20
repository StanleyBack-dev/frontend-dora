import QRCode from "qrcode";

/**
 * The pickup code as a QR code (SVG markup). It carries only the code: the
 * desk's reader (or the camera) fills the code field with it.
 */
export function parcelQrSvg(code: string): Promise<string> {
  return QRCode.toString(code, {
    type: "svg",
    // M: survives a cracked screen or a glare without growing too dense.
    errorCorrectionLevel: "M",
    margin: 1,
    color: { dark: "#111111", light: "#ffffff" },
  });
}
