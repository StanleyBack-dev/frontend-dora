// Reads a QR code from the camera's video. The browser's own reader
// (BarcodeDetector: Chrome on Android, Edge) when it exists; elsewhere
// (Safari on iPhone, Firefox) jsQR decodes the frames drawn on a canvas,
// loaded only when needed.

type Detector = {
  detect(source: HTMLVideoElement): Promise<{ rawValue: string }[]>;
};
type DetectorClass = new (options: { formats: string[] }) => Detector;

/** Reads the QR in the current frame (null: none found yet). */
export type QrReader = (video: HTMLVideoElement) => Promise<string | null>;

/** Largest side of the frame jsQR scans (smaller is faster, still reads). */
const FRAME_MAX_SIDE = 640;

/** Whether this browser can open the camera (any reader works then). */
export const canOpenCamera = () =>
  typeof navigator !== "undefined" &&
  Boolean(navigator.mediaDevices?.getUserMedia);

export async function createQrReader(): Promise<QrReader> {
  const Native = (globalThis as { BarcodeDetector?: DetectorClass })
    .BarcodeDetector;
  if (Native) {
    const detector = new Native({ formats: ["qr_code"] });
    return async (video) => {
      const [found] = await detector.detect(video);
      return found?.rawValue || null;
    };
  }

  const { default: jsQR } = await import("jsqr");
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d", { willReadFrequently: true });
  return async (video) => {
    if (!context || video.videoWidth === 0) return null;
    const scale = Math.min(
      1,
      FRAME_MAX_SIDE / Math.max(video.videoWidth, video.videoHeight),
    );
    canvas.width = Math.round(video.videoWidth * scale);
    canvas.height = Math.round(video.videoHeight * scale);
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    const frame = context.getImageData(0, 0, canvas.width, canvas.height);
    const found = jsQR(frame.data, frame.width, frame.height, {
      inversionAttempts: "dontInvert",
    });
    return found?.data || null;
  };
}
