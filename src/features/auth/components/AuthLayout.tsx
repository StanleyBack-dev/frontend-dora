import type { ReactNode } from "react";
import Link from "next/link";
import { BellRing, CalendarCheck, Smartphone } from "lucide-react";
import { cn } from "@/design-system";
import { Wordmark } from "@/features/layout/components/Logo";
import { LogoMark } from "@/features/layout/components/LogoMark";

const HIGHLIGHTS = [
  { icon: CalendarCheck, text: "Veja os horários livres e reserve na hora" },
  { icon: BellRing, text: "Avisos e comunicados do condomínio no celular" },
  { icon: Smartphone, text: "Instale como aplicativo na tela inicial" },
];

// Frame of the signed-out pages (login, recovery, first access, sign-up).
// Desktop: the brand panel (black, with orange shapes) next to the form.
// Phones: the mark on top and the form below, nothing else in the way.
export function AuthLayout({
  title,
  description,
  children,
  wide = false,
}: {
  /** Omit when the content draws its own heading (e.g. a flow by steps). */
  title?: string;
  description?: ReactNode;
  children: ReactNode;
  /** Room for a longer form (e.g. the public sign-up). */
  wide?: boolean;
}) {
  return (
    <main className="grid min-h-dvh bg-surface lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <section className="relative m-3 hidden flex-col justify-between overflow-hidden rounded-[2rem] bg-chrome p-12 text-chrome-fg lg:flex">
        {/* A ball on the court: one big orange circle and a faint ring. */}
        <span
          aria-hidden
          className="absolute -top-32 -right-32 size-[26rem] rounded-full bg-brand"
        />
        <span
          aria-hidden
          className="absolute -bottom-40 -left-24 size-[28rem] rounded-full border-2 border-chrome-fg/10"
        />

        <div className="relative flex items-center gap-3">
          <LogoMark className="size-11" />
          <Wordmark tone="light" className="text-3xl" />
        </div>

        <div className="relative max-w-md">
          <p className="inline-flex rounded-full bg-chrome-hover px-3 py-1 text-[11px] font-bold tracking-[0.16em] text-brand uppercase">
            Seu condomínio, mais simples
          </p>
          <h2 className="mt-5 text-[2.6rem] leading-[1.08] font-extrabold tracking-tight">
            Reserve quadras e espaços em poucos toques.
          </h2>
          <ul className="mt-9 space-y-4">
            {HIGHLIGHTS.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3 text-[15px]">
                <span className="grid size-10 shrink-0 place-items-center rounded-full bg-chrome-hover text-brand">
                  <Icon aria-hidden className="size-[18px]" />
                </span>
                <span className="text-chrome-muted">{text}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-xs text-chrome-subtle">
          Acesso para moradores e administração do condomínio.
        </p>
      </section>

      <section className="flex flex-col items-center justify-center px-5 py-10 sm:px-8">
        <div className={cn("w-full", wide ? "max-w-xl" : "max-w-sm")}>
          <div className="mb-10 flex flex-col items-center text-center lg:hidden">
            <LogoMark className="size-16 drop-shadow-[0_12px_28px_rgb(255_107_26/0.35)]" />
            <Wordmark className="mt-4 text-4xl" />
            <p className="mt-1.5 text-sm text-muted">
              Reservas do seu condomínio
            </p>
          </div>

          {title && (
            <h1 className="text-[28px] leading-tight font-extrabold tracking-tight text-fg">
              {title}
            </h1>
          )}
          {description && (
            <p className="mt-2 text-sm text-muted">{description}</p>
          )}
          <div className={title ? "mt-8" : undefined}>{children}</div>

          <p className="mt-12 text-center text-xs text-soft">
            <Link href="/termos" className="hover:text-fg hover:underline">
              Termos de uso e privacidade
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
