"use client";

import { useState, useSyncExternalStore, type SetStateAction } from "react";
import {
  clearFormDraft,
  loadFormDraft,
  saveFormDraft,
} from "@/shared/lib/form-draft";

const same = (a: unknown, b: unknown) =>
  JSON.stringify(a) === JSON.stringify(b);

const noSubscription = () => () => {};

/**
 * A form's state that survives closing the drawer, a reload or leaving the
 * page (in this tab), until it is sent or discarded.
 *
 * - `set` works like useState's setter and saves each change (an untouched
 *   form saves nothing);
 * - with `open` (a drawer), the saved draft comes back each time it opens;
 *   with `restoreOnMount` (a form on the page), once the page is hydrated;
 *   otherwise call `restore()` from an event (never on the server render);
 * - `discard()` empties the form and forgets the draft ("Cancelar", or
 *   after sending);
 * - `restored` says the form came from a draft (to show DraftNotice).
 */
export function useFormDraft<T>(
  key: string,
  empty: T,
  parse: (raw: unknown) => T | null,
  options: { open?: boolean; restoreOnMount?: boolean } = {},
) {
  const [blank] = useState(empty);
  const [value, setValue] = useState<T>(empty);
  const [restored, setRestored] = useState(false);
  const [wasOpen, setWasOpen] = useState(false);
  // A form on the page counts as open once hydrated (the server renders it
  // blank, so the first client render matches).
  const hydrated = useSyncExternalStore(
    noSubscription,
    () => true,
    () => false,
  );
  const open = options.open ?? (options.restoreOnMount ? hydrated : undefined);

  // Opening brings the draft back (during render: no effect, and never on
  // the server).
  if (open !== undefined && open !== wasOpen) {
    setWasOpen(open);
    if (open && same(value, blank)) {
      const saved = loadFormDraft(key, parse);
      if (saved && !same(saved, blank)) {
        setValue(saved);
        setRestored(true);
      }
    }
  }

  function set(next: SetStateAction<T>) {
    setValue((previous) => {
      const resolved =
        typeof next === "function"
          ? (next as (previous: T) => T)(previous)
          : next;
      // Saving is idempotent, so running twice (Strict Mode) is harmless.
      if (same(resolved, blank)) clearFormDraft(key);
      else saveFormDraft(key, resolved);
      return resolved;
    });
  }

  function restore() {
    // A form already being filled is not overwritten.
    if (!same(value, blank)) return;
    const saved = loadFormDraft(key, parse);
    if (!saved || same(saved, blank)) return;
    setValue(saved);
    setRestored(true);
  }

  function discard() {
    setValue(blank);
    setRestored(false);
    clearFormDraft(key);
  }

  return { value, set, restore, discard, restored };
}
