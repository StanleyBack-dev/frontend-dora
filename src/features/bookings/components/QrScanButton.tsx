"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { ScanLine } from "lucide-react";
import { Alert, Button, Modal } from "@/design-system";
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
      <Button
        type="button"
        variant="secondary"
        disabled={disabled}
        icon={<ScanLine className="size-4" />}
        onClick={() => {
          setError(null);
          setOpen(true);
        }}
      >
        Ler QR code
      </Button>
      <Modal open={open} onClose={() => setOpen(false)} title="Ler o QR code">
        <div className="space-y-3">
          {error ? (
            <Alert tone="warning">{error}</Alert>
          ) : (
            <p className="text-sm text-muted">
              Aponte a câmera para o QR code no celular da pessoa.
            </p>
          )}
          <video
            ref={video}
            muted
            playsInline
            className="aspect-square w-full rounded-xl bg-black object-cover"
          />
        </div>
      </Modal>
    </>
  );
}
