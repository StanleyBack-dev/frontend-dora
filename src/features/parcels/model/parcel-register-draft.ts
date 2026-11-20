// While the camera or the gallery is open, the phone may discard the page to
// free memory; when the person comes back, the page loads again from scratch.
// The "receive parcel" form is saved just before (in this tab only) so it
// reopens with what was typed. Only the texts: the photo is picked again.

const KEY = "dora:parcel-register-draft";

// What was stored when this page loaded (read once: a draft saved later, in
// the same page, is not a reload to recover from).
let atLoad: string | null | undefined;

import type { ParcelRecipient } from "@/shared/contracts/parcels";

export type ParcelRegisterDraft = {
  unitId: string | null;
  /** Chosen by name (null: by unit). */
  recipient: ParcelRecipient | null;
  recipientName: string;
  carrier: string;
  trackingCode: string;
  storageLocation: string;
  notes: string;
};

/** Saves the form before leaving for the camera or the gallery. */
export function saveParcelDraft(draft: ParcelRegisterDraft) {
  try {
    sessionStorage.setItem(KEY, JSON.stringify(draft));
  } catch {
    // Storage blocked or full: nothing to restore, the form still works.
  }
}

/** Forgets the draft (the photo came back, or the form was closed). */
export function clearParcelDraft() {
  try {
    sessionStorage.removeItem(KEY);
  } catch {
    // Storage blocked: nothing was saved.
  }
}

/**
 * The draft found when the page loaded, as stored (a stable string, for
 * useSyncExternalStore).
 */
export function storedParcelDraft(): string | null {
  if (atLoad === undefined) {
    try {
      atLoad = sessionStorage.getItem(KEY);
    } catch {
      atLoad = null;
    }
  }
  return atLoad;
}

/** The restored form was closed: navigating back here starts blank. */
export function forgetLoadedParcelDraft() {
  atLoad = null;
}

const text = (value: unknown) => (typeof value === "string" ? value : "");

const recipientFrom = (value: unknown): ParcelRecipient | null => {
  const raw = value as Record<string, unknown> | null;
  return raw &&
    typeof raw.userId === "string" &&
    typeof raw.name === "string" &&
    typeof raw.unitId === "string" &&
    typeof raw.unitLabel === "string"
    ? {
        userId: raw.userId,
        name: raw.name,
        unitId: raw.unitId,
        unitLabel: raw.unitLabel,
      }
    : null;
};

/** Reads a stored draft (anything malformed is ignored). */
export function parseParcelDraft(
  stored: string | null,
): ParcelRegisterDraft | null {
  if (!stored) return null;
  try {
    const raw = JSON.parse(stored) as Record<string, unknown>;
    return {
      unitId: typeof raw.unitId === "string" ? raw.unitId : null,
      recipient: recipientFrom(raw.recipient),
      recipientName: text(raw.recipientName),
      carrier: text(raw.carrier),
      trackingCode: text(raw.trackingCode),
      storageLocation: text(raw.storageLocation),
      notes: text(raw.notes),
    };
  } catch {
    return null;
  }
}
