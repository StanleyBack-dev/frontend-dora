import type { ReactNode } from "react";

type BlockedScreenProps = {
  /** Icon drawn on the orange tile (lucide, size-7). */
  icon: ReactNode;
  /** Short label above the title, e.g. "Acesso restrito". */
  eyebrow: string;
  title: string;
  description: ReactNode;
  /** Buttons/links, main one first. */
  actions: ReactNode;
};

// A page the person cannot use (no permission, module not contracted):
// centered in the content area, on the brand's black header with the orange
// mark, so it reads as a deliberate stop and not as a broken page.
export function BlockedScreen({
  icon,
  eyebrow,
  title,
  description,
  actions,
}: BlockedScreenProps) {
  return (
    <div className="grid min-h-[calc(100dvh-10rem)] place-items-center py-8">
      <section className="w-full max-w-md overflow-hidden rounded-xl border border-border bg-surface text-center shadow-card">
        <div className="relative isolate overflow-hidden bg-chrome px-6 pt-10 pb-14">
          <span
            aria-hidden
            className="absolute -top-16 -right-16 -z-10 size-48 rounded-full bg-brand/30 blur-2xl"
          />
          <span
            aria-hidden
            className="absolute -bottom-20 -left-12 -z-10 size-40 rounded-full bg-brand/15 blur-2xl"
          />
          <span className="mx-auto grid size-16 place-items-center rounded-2xl bg-brand text-brand-fg shadow-lg ring-8 ring-brand/15">
            {icon}
          </span>
          <p className="mt-5 text-xs font-bold tracking-wider text-brand uppercase">
            {eyebrow}
          </p>
        </div>
        <div className="-mt-6 rounded-t-3xl bg-surface px-6 pt-7 pb-8">
          <h1 className="text-xl font-bold text-balance text-fg">{title}</h1>
          <p className="mx-auto mt-2 max-w-sm text-sm text-pretty text-muted">
            {description}
          </p>
          <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-center">
            {actions}
          </div>
        </div>
      </section>
    </div>
  );
}
