import type {
  SignatureDevice,
  SignatureLocation,
} from "@/shared/contracts/signature";

// What the device tells about the moment of a signature: where it was
// (when the browser allows), its clock and time zone, and the device. The
// API adds its own time, the IP and the browser, and digests it all.

/** How long to wait for the location before signing without it. */
const LOCATION_TIMEOUT_MS = 8000;

/**
 * The device's location, asked once (the browser may show its prompt).
 * Never fails: a refusal or a timeout is recorded as such.
 */
export function readLocation(): Promise<SignatureLocation> {
  if (typeof navigator === "undefined" || !navigator.geolocation) {
    return Promise.resolve({ status: "UNAVAILABLE" });
  }
  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (position) =>
        resolve({
          status: "GRANTED",
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracyMeters: position.coords.accuracy,
        }),
      (error) =>
        resolve({
          status:
            error.code === error.PERMISSION_DENIED ? "DENIED" : "UNAVAILABLE",
        }),
      {
        enableHighAccuracy: true,
        timeout: LOCATION_TIMEOUT_MS,
        maximumAge: 60_000,
      },
    );
  });
}

/** The device the signature is drawn on; `pointerType` is how it was drawn. */
export function readDevice(pointerType: string | null): SignatureDevice {
  const nav = navigator as Navigator & {
    userAgentData?: { platform?: string };
  };
  return {
    platform: (nav.userAgentData?.platform || nav.platform || "").slice(0, 60),
    language: nav.language?.slice(0, 35) ?? null,
    screenWidth: Math.round(window.screen.width),
    screenHeight: Math.round(window.screen.height),
    pixelRatio: Math.round(window.devicePixelRatio * 100) / 100,
    pointerType,
    maxTouchPoints: nav.maxTouchPoints ?? 0,
  };
}

/** The device's time zone ("America/Sao_Paulo"). */
export const deviceTimeZone = () =>
  Intl.DateTimeFormat().resolvedOptions().timeZone ?? null;

const POINTER_LABELS: Record<string, string> = {
  touch: "o dedo",
  pen: "caneta",
  mouse: "mouse",
};

/** The device facts worth reading, from the stored JSON (the receipt). */
export function deviceFacts(json: string): string | null {
  try {
    const device = JSON.parse(json) as Record<string, unknown>;
    const parts = [
      typeof device.platform === "string" ? device.platform : null,
      typeof device.pointerType === "string"
        ? `assinado com ${POINTER_LABELS[device.pointerType] ?? device.pointerType}`
        : null,
      typeof device.screenWidth === "number" &&
      typeof device.screenHeight === "number"
        ? `tela ${device.screenWidth}×${device.screenHeight}`
        : null,
      typeof device.language === "string" ? device.language : null,
    ].filter(Boolean);
    return parts.length > 0 ? parts.join(" · ") : null;
  } catch {
    return null;
  }
}

/** Who handed it over, by their profile (the receipt). */
export const COLLECTED_BY_ROLE_LABELS: Record<string, string> = {
  CONCIERGE: "Portaria",
  ADMIN: "Administração",
  ADMIN_MASTER: "Administração",
};

export const LOCATION_LABELS: Record<SignatureLocation["status"], string> = {
  GRANTED: "Localização registrada",
  DENIED: "Localização recusada no aparelho",
  UNAVAILABLE: "Localização indisponível",
};
