"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Camera, ScanQrCode } from "lucide-react";
import { Alert, Button, Modal, Spinner } from "@/design-system";
import { codeFromScan } from "@/features/bookings/model/invite-qr";
import {
  canOpenCamera,
  createQrReader,
  type QrReader,
} from "@/features/bookings/model/qr-reader";

// Reads a QR code with the phone's camera (invites, event tickets, parcel
// pickup codes) on any browser that can open the camera: its own reader or
// jsQR (Safari on iPhone, Firefox). Without a camera the button is not
// shown and the code is typed.

/** Checks a few times per second, not on every frame. */
const SCAN_EVERY_MS = 250;

export function QrScanButton({
  onCode,
  disabled = false,
}: {
  /** The invite code read from the QR (a link or the code itself). */
  onCode: (code: string) => void;
  disabled?: boolean;
}) {
  const canScan = useSyncExternalStore(
    () => () => {},
    canOpenCamera,
    () => false,
  );
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // The camera's picture is showing (until then, "Abrindo a câmera…").
  const [ready, setReady] = useState(false);
  const video = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!open) return;
    let stream: MediaStream | null = null;
    let timer: ReturnType<typeof setTimeout> | null = null;
    let stopped = false;
    let read: QrReader | null = null;

    const stop = () => {
      stopped = true;
      if (timer) clearTimeout(timer);
      stream?.getTracks().forEach((track) => track.stop());
    };

    const scan = async () => {
      if (stopped || !video.current || !read) return;
      try {
        const text = await read(video.current);
        if (text) {
          stop();
          setOpen(false);
          onCode(codeFromScan(text));
          return;
        }
      } catch {
        // A frame that couldn't be read: try the next one.
      }
      timer = setTimeout(scan, SCAN_EVERY_MS);
    };

    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: "environment" }, audio: false })
      .then(async (media) => {
        if (stopped) {
          media.getTracks().forEach((track) => track.stop());
          return;
        }
        stream = media;
        read = await createQrReader();
        if (video.current) {
          video.current.srcObject = media;
          await video.current.play();
        }
        setReady(true);
        void scan();
      })
      .catch(() =>
        setError(
          "Não foi possível abrir a câmera. Libere o acesso à câmera para este site ou digite o código.",
        ),
      );
    return stop;
  }, [open, onCode]);

  if (!canScan) return null;
  return (
    <>
      {/* The same height as the code field's action beside it, in the
          brand colour: on a phone, reading the QR is the quickest way. */}
      <Button
        type="button"
        variant="brand"
        size="lg"
        className="justify-center"
        disabled={disabled}
        icon={<ScanQrCode className="size-5" />}
        onClick={() => {
          setError(null);
          setReady(false);
          setOpen(true);
        }}
      >
        Escanear QR code
      </Button>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        icon={<ScanQrCode className="size-5" />}
        title="Escanear QR code"
      >
        <div className="space-y-3">
          {error ? (
            <Alert tone="warning">{error}</Alert>
          ) : (
            <p className="text-sm text-muted">
              Aponte a câmera para o QR code no celular da pessoa: a leitura é
              automática.
            </p>
          )}
          <div className="relative overflow-hidden rounded-2xl bg-black">
            <video
              ref={video}
              muted
              playsInline
              className="aspect-square w-full object-cover"
            />
            {!error && (
              <div aria-hidden className="pointer-events-none absolute inset-0">
                {/* The viewfinder: four brand corners around the middle. */}
                <div className="absolute inset-[14%]">
                  <span className="absolute top-0 left-0 size-10 rounded-tl-2xl border-t-4 border-l-4 border-brand" />
                  <span className="absolute top-0 right-0 size-10 rounded-tr-2xl border-t-4 border-r-4 border-brand" />
                  <span className="absolute bottom-0 left-0 size-10 rounded-bl-2xl border-b-4 border-l-4 border-brand" />
                  <span className="absolute right-0 bottom-0 size-10 rounded-br-2xl border-r-4 border-b-4 border-brand" />
                  {ready && (
                    <span className="absolute inset-x-3 top-1/2 h-0.5 animate-pulse rounded-full bg-brand shadow-[0_0_12px_var(--brand)]" />
                  )}
                </div>
                {!ready && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-sm text-white/90">
                    <Spinner />
                    <span className="flex items-center gap-1.5">
                      <Camera className="size-4" />
                      Abrindo a câmera…
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </Modal>
    </>
  );
}
