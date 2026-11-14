"use client";

import { useState } from "react";
import { Spinner } from "@/design-system";
import { notificationsClient } from "@/features/notifications/api/notifications.client";
import { NOTIFICATION_TYPE_LABELS } from "@/features/notifications/model/notification-labels";
import type { NotificationPreference } from "@/shared/contracts/notifications";
import { ApiClientError } from "@/shared/lib/api-client";
import { useToast } from "@/shared/toast/useToast";

// Which notices also go by e-mail. In the app they always show up.
export function NotificationPreferences({
  initial,
}: {
  initial: NotificationPreference[];
}) {
  const [preferences, setPreferences] = useState(initial);
  // Types being saved: spinner beside the box, which waits for the answer.
  const [saving, setSaving] = useState<ReadonlySet<string>>(new Set());
  const { showError } = useToast();

  async function toggle(preference: NotificationPreference) {
    const emailEnabled = !preference.emailEnabled;
    const apply = (value: boolean) =>
      setPreferences((current) =>
        current.map((item) =>
          item.type === preference.type
            ? { ...item, emailEnabled: value }
            : item,
        ),
      );
    const mark = (on: boolean) =>
      setSaving((current) => {
        const next = new Set(current);
        if (on) next.add(preference.type);
        else next.delete(preference.type);
        return next;
      });
    apply(emailEnabled);
    mark(true);
    try {
      await notificationsClient.setPreference(preference.type, emailEnabled);
    } catch (cause) {
      apply(!emailEnabled);
      showError(
        cause instanceof ApiClientError ? cause.message : "Não foi possível.",
      );
    }
    mark(false);
  }

  return (
    <div className="space-y-3">
      <ul className="divide-y divide-border">
        {preferences.map((preference) => {
          const meta = NOTIFICATION_TYPE_LABELS[preference.type];
          const id = `pref-${preference.type}`;
          return (
            <li key={preference.type} className="flex items-start gap-3 py-2.5">
              <label
                htmlFor={id}
                className="min-w-0 flex-1 cursor-pointer text-sm"
              >
                <span className="block font-medium text-fg">{meta.label}</span>
                <span className="block text-xs text-soft">
                  {meta.description}
                </span>
              </label>
              {saving.has(preference.type) && (
                <Spinner
                  size="sm"
                  className="mt-1 text-soft"
                  label="Salvando"
                />
              )}
              <input
                id={id}
                type="checkbox"
                className="mt-1 size-4 accent-[var(--accent)]"
                checked={preference.emailEnabled}
                disabled={saving.has(preference.type)}
                aria-busy={saving.has(preference.type) || undefined}
                onChange={() => void toggle(preference)}
              />
            </li>
          );
        })}
      </ul>
    </div>
  );
}
