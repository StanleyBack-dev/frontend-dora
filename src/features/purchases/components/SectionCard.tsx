import type { ReactNode } from "react";
import { Card } from "@/design-system";

/**
 * A part of a purchases page (the order, the deliveries, the payments, the
 * rating, the indicators) in a card: a header with the icon, title, one
 * line of help and its actions (stacked under it on a phone), and the
 * content below.
 */
export function SectionCard({
  icon,
  title,
  description,
  actions,
  children,
}: {
  icon: ReactNode;
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <Card className="overflow-visible">
      <div className="flex flex-col gap-3 border-b border-border px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="min-w-0">
          <h2 className="flex items-center gap-2 text-base font-semibold text-fg">
            <span aria-hidden className="text-soft [&>svg]:size-4">
              {icon}
            </span>
            {title}
          </h2>
          {description && <p className="text-xs text-muted">{description}</p>}
        </div>
        {actions && (
          <div className="grid gap-2 sm:flex sm:shrink-0 sm:justify-end">
            {actions}
          </div>
        )}
      </div>
      <div className="space-y-4 p-4 sm:p-6">{children}</div>
    </Card>
  );
}
