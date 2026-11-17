import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Card } from "@/design-system";
import type { NavItem } from "@/features/layout/model/navigation";

/** What each page of the administration is for. */
const DESCRIPTIONS: Record<string, string> = {
  "/plataforma/condominios":
    "Cadastre, edite, suspenda e entre em cada condomínio para dar suporte.",
  "/plataforma/pessoas":
    "Todas as contas do Dora: onde cada pessoa tem acesso e com qual papel.",
  "/plataforma/modulos":
    "Ligue e desligue os módulos contratados (reservas, eventos) por condomínio.",
  "/plataforma/logs":
    "Erros, eventos de segurança e falhas das rotinas, com filtros.",
};

// The administration's pages as cards: a row that slides sideways on
// phones and a grid from sm up. The whole card opens its page.
export function PlatformShortcuts({ pages }: { pages: NavItem[] }) {
  return (
    <section aria-labelledby="administracao-atalhos" className="mb-8">
      <h2 id="administracao-atalhos" className="mb-3 text-lg font-bold text-fg">
        Gerenciar a plataforma
      </h2>
      <ul className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 xl:grid-cols-4">
        {pages.map(({ href, label, icon: Icon }) => (
          <li key={href} className="w-64 shrink-0 snap-start sm:w-auto">
            <Link href={href} className="group block h-full">
              <Card className="flex h-full flex-col gap-3 p-5 transition-all group-hover:-translate-y-0.5 group-hover:border-brand-border">
                <span className="grid size-11 place-items-center rounded-2xl bg-brand text-brand-fg">
                  <Icon aria-hidden className="size-5" />
                </span>
                <span className="text-base font-bold text-fg">{label}</span>
                <span className="text-[13px] text-muted">
                  {DESCRIPTIONS[href]}
                </span>
                <span className="mt-auto flex items-center gap-1 text-sm font-semibold text-brand-ink">
                  Abrir
                  <ArrowUpRight aria-hidden className="size-4" />
                </span>
              </Card>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
