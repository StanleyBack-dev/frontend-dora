import { cn } from "@/design-system";

// What the guest shows at the gate: the QR code (the gate scans it) and the
// same code in letters, large and split in two halves so it is easy to read
// out loud and to type.
export function InviteCode({
  code,
  qrSvg,
  muted = false,
}: {
  code: string;
  /** SVG markup of the QR code (inviteQrSvg), generated on the server. */
  qrSvg: string;
  /** The invite no longer works (cancelled or ended). */
  muted?: boolean;
}) {
  const halves = [code.slice(0, 4), code.slice(4)];
  return (
    <div
      className={cn(
        "rounded-2xl border-2 border-dashed p-5 text-center",
        muted ? "border-border opacity-60" : "border-brand",
      )}
    >
      {!muted && (
        <div
          role="img"
          aria-label="QR code do convite"
          className="mx-auto mb-4 w-52 rounded-xl bg-white p-2 sm:w-60 [&>svg]:h-auto [&>svg]:w-full"
          // Our own SVG, made by the qrcode library from the invite's link.
          dangerouslySetInnerHTML={{ __html: qrSvg }}
        />
      )}
      <p className="text-xs font-bold tracking-[0.14em] text-muted uppercase">
        Código do convite
      </p>
      <p
        aria-label={`Código ${code.split("").join(" ")}`}
        className="mt-2 font-mono text-4xl font-extrabold tracking-[0.18em] text-fg sm:text-5xl"
      >
        {halves[0]}
        <span aria-hidden className="mx-2 text-soft">
          ·
        </span>
        {halves[1]}
      </p>
    </div>
  );
}
