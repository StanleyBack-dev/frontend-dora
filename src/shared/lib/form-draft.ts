// What was typed in a form, kept in this tab (sessionStorage) while it is
// not sent: closing a drawer, a reload or leaving the page does not lose it.
// Only texts and choices go here, never files. Leaving the account or
// switching condominium clears every draft (they belong to that context).

const PREFIX = "dora:draft:";

const storage = (): Storage | null => {
  try {
    return typeof window === "undefined" ? null : window.sessionStorage;
  } catch {
    return null;
  }
};

/** The saved draft, checked by `parse` (null: none, or no longer valid). */
export function loadFormDraft<T>(
  key: string,
  parse: (raw: unknown) => T | null,
): T | null {
  try {
    const raw = storage()?.getItem(PREFIX + key);
    return raw ? parse(JSON.parse(raw)) : null;
  } catch {
    return null;
  }
}

export function saveFormDraft(key: string, value: unknown) {
  try {
    storage()?.setItem(PREFIX + key, JSON.stringify(value));
  } catch {
    // Storage full or blocked: the form still works, without a draft.
  }
}

export function clearFormDraft(key: string) {
  try {
    storage()?.removeItem(PREFIX + key);
  } catch {
    // Storage blocked: nothing was saved.
  }
}

/** Every draft of this tab (leaving the account, switching condominium). */
export function clearFormDrafts() {
  const store = storage();
  if (!store) return;
  try {
    const keys: string[] = [];
    for (let index = 0; index < store.length; index += 1) {
      const key = store.key(index);
      if (key?.startsWith(PREFIX)) keys.push(key);
    }
    keys.forEach((key) => store.removeItem(key));
  } catch {
    // Storage blocked: nothing was saved.
  }
}

/** Keeps the fields of `value` that `template` has, with the same types. */
export function sameShape<T extends Record<string, unknown>>(
  template: T,
  value: unknown,
): T | null {
  if (!value || typeof value !== "object") return null;
  const source = value as Record<string, unknown>;
  const result = { ...template };
  for (const key of Object.keys(template) as (keyof T)[]) {
    const expected = template[key];
    const found = source[key as string];
    if (found === undefined) continue;
    if (
      found === null ||
      expected === null ||
      typeof found === typeof expected
    ) {
      result[key] = found as T[keyof T];
    }
  }
  return result;
}
