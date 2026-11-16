import { cn } from "@/design-system";

// What the guest shows at the gate: the QR code (the gate scans it) and the
// same code in letters, large and split in two halves so it is easy to read
// out loud and to type. Also an event ticket (its own label, 10 characters).
export function InviteCode({
  code,
  qrSvg,
  muted = false,
  label = "Código do convite",
  qrLabel = "QR code do convite",
}: {
  code: string;
  /** SVG markup of the QR code (inviteQrSvg). */
  qrSvg: string;
  /** The invite no longer works (cancelled or ended). */
  muted?: boolean;
  label?: string;
  qrLabel?: string;
}) {
  const middle = Math.ceil(code.length / 2);
  const halves = [code.slice(0, middle), code.slice(middle)];
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
          aria-label={qrLabel}
          className="mx-auto mb-4 w-52 rounded-xl bg-white p-2 sm:w-60 [&>svg]:h-auto [&>svg]:w-full"
          // Our own SVG, made by the qrcode library from the link.
          dangerouslySetInnerHTML={{ __html: qrSvg }}
        />
      )}
      <p className="text-xs font-bold tracking-[0.14em] text-muted uppercase">
        {label}
      </p>
      <p
        aria-label={`Código ${code.split("").join(" ")}`}
        className={cn(
          "mt-2 font-mono font-extrabold tracking-[0.18em] text-fg",
          // A ticket code (10) a size down, so it fits a phone.
          code.length > 8 ? "text-3xl sm:text-4xl" : "text-4xl sm:text-5xl",
        )}
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
