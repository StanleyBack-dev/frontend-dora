import type { ReactNode } from "react";
import { PageTitleAddon } from "@/design-system/components/PageTitleAddon";

type PageHeaderProps = {
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
};

export function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <header className="mb-6 flex flex-col gap-3 pb-1 lg:flex-row lg:items-end lg:justify-between">
      <div className="min-w-0">
        <div className="flex items-center gap-1.5">
          <h1 className="min-w-0 text-2xl font-bold tracking-tight text-fg sm:text-[28px]">
            {title}
          </h1>
          {/* What the app puts next to every title (the page's help). */}
          <PageTitleAddon />
        </div>
        {description && (
          <p className="mt-1.5 text-sm text-muted">{description}</p>
        )}
      </div>
      {actions && (
        <div className="flex w-full flex-wrap items-center gap-2 lg:w-auto lg:justify-end">
          {actions}
        </div>
      )}
    </header>
  );
}
