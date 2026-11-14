"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/design-system";
import { notificationsClient } from "@/features/notifications/api/notifications.client";
import { NOTIFICATIONS_READ_EVENT } from "@/features/notifications/model/notification-events";
import { formatWhen } from "@/features/notifications/model/notification-labels";
import { startNavigation } from "@/shared/lib/navigation-progress";
import type { AppNotification } from "@/shared/contracts/notifications";

// Opening the notifications marks them all read. What was new keeps its
// highlight while the page is open, so the person still sees what arrived;
// opening one goes to what it is about.
export function NotificationList({
  notifications,
  now,
}: {
  notifications: AppNotification[];
  /** Request time from the server, so "há 5 min" is stable on render. */
  now: string;
}) {
  const router = useRouter();
  // The list as it was when the page opened (the parent remounts this per
  // page/filter): refreshing after marking must not empty "Não lidas".
  const [items] = useState(notifications);
  const reference = new Date(now);

  useEffect(() => {
    if (!items.some((item) => !item.readAt)) return;
    let cancelled = false;
    notificationsClient
      .markAllRead()
      .then(() => {
        if (cancelled) return;
        // Counters in the header and the menu.
        window.dispatchEvent(new Event(NOTIFICATIONS_READ_EVENT));
        router.refresh();
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [items, router]);

  function open(item: AppNotification) {
    if (!item.link) return;
    startNavigation();
    router.push(item.link);
  }

  return (
    <ul className="divide-y divide-border rounded-lg border border-border">
      {items.map((item) => {
        const fresh = !item.readAt;
        return (
          <li key={item.id}>
            <button
              type="button"
              onClick={() => open(item)}
              className={cn(
                "flex w-full gap-3 px-3 py-3 text-left text-sm transition-colors hover:bg-surface-muted",
                fresh && "bg-accent-soft/40",
                !item.link && "cursor-default",
              )}
            >
              <span
                aria-hidden
                className={cn(
                  "mt-1.5 size-2 shrink-0 rounded-full",
                  fresh ? "bg-accent" : "bg-transparent",
                )}
              />
              <span className="min-w-0 flex-1">
                <span className={cn("block text-fg", fresh && "font-semibold")}>
                  {item.title}
                </span>
                {item.body && (
                  <span className="block text-muted first-letter:uppercase">
                    {item.body}
                  </span>
                )}
              </span>
              <span className="shrink-0 text-xs text-soft">
                {formatWhen(item.createdAt, reference)}
              </span>
              {fresh && <span className="sr-only">(nova)</span>}
            </button>
          </li>
        );
      })}
    </ul>
  );
}
