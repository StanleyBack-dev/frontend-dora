import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import {
  ArrowUpRight,
  Bell,
  Building2,
  CalendarClock,
  CircleUserRound,
  LifeBuoy,
  Megaphone,
} from "lucide-react";
import { Card } from "@/design-system";
import { GROUP_LABELS } from "@/features/access/model/access-labels";
import { DashboardPanel } from "@/features/dashboard/components/DashboardPanel";
import { authed, getSessionUser } from "@/server/auth/current-user";
import { dashboardService } from "@/server/services/dashboard.service";
import { can } from "@/shared/lib/access";

export const metadata: Metadata = { title: "Início" };

/** "Bom dia" / "Boa tarde" / "Boa noite" in the app's time zone. */
function greeting(now = new Date()): string {
  const hour = Number(
    new Intl.DateTimeFormat("en-US", {
      timeZone: "America/Sao_Paulo",
      hour: "numeric",
      hour12: false,
    }).format(now),
  );
  if (hour >= 5 && hour < 12) return "Bom dia";
  if (hour >= 12 && hour < 18) return "Boa tarde";
  return "Boa noite";
}

function Shortcut({
  href,
  icon,
  title,
  description,
}: {
  href: string;
  icon: ReactNode;
  title: string;
  description: string;
}) {
  return (
    <Link href={href} className="group block h-full">
      <Card className="flex h-full flex-col gap-4 p-5 transition-all group-hover:-translate-y-0.5 group-hover:border-brand-border">
        <div className="flex items-start justify-between">
          <span className="grid size-11 place-items-center rounded-full bg-brand-soft text-fg [&>svg]:size-5">
            {icon}
          </span>
          <ArrowUpRight
            aria-hidden
            className="size-5 text-soft transition-colors group-hover:text-brand-ink"
          />
        </div>
        <span>
          <span className="block font-bold text-fg">{title}</span>
          <span className="mt-0.5 block text-[13px] text-muted">
            {description}
          </span>
        </span>
      </Card>
    </Link>
  );
}

export default async function HomePage() {
  const user = await getSessionUser();
  const condominium = user.condominium;
  // The overview is the condominium's: none without one.
  const isManager = Boolean(condominium) && can(user, "DASHBOARD_READ");
  const dashboard = isManager
    ? await authed((token) => dashboardService.get(token))
    : null;
  const firstName = user.name.split(" ")[0];

  return (
    <div className="space-y-6 sm:space-y-8">
      <section className="relative overflow-hidden rounded-[1.75rem] bg-chrome px-6 py-8 text-chrome-fg sm:px-10 sm:py-10">
        <span
          aria-hidden
          className="absolute -top-24 -right-16 size-64 rounded-full bg-brand sm:-top-28 sm:right-0 sm:size-80"
        />
        <span
          aria-hidden
          className="absolute -bottom-28 right-40 hidden size-56 rounded-full border-2 border-chrome-fg/10 sm:block"
        />
        <div className="relative max-w-lg">
          <p className="text-sm font-semibold text-chrome-muted">
            {greeting()}
            {condominium
              ? ` · ${condominium.name}`
              : user.platformAdmin
                ? " · administração do Dora"
                : ""}
          </p>
          <h1 className="mt-1 text-3xl font-extrabold tracking-tight sm:text-4xl">
            Olá, {firstName}!
          </h1>
          <p className="mt-3 text-[15px] text-chrome-muted">
            {condominium
              ? `Você está como ${GROUP_LABELS[user.group].toLowerCase()}. Tudo do condomínio em um só lugar; as reservas de quadras e espaços chegam aqui em breve.`
              : user.platformAdmin
                ? "Você está na visão da plataforma. Escolha um condomínio para trabalhar nele, ou gerencie todos no console."
                : "Você ainda não tem acesso a um condomínio. Peça à administração do seu condomínio o link de cadastro."}
          </p>
        </div>
      </section>

      {!condominium && user.platformAdmin && (
        <Shortcut
          href="/plataforma"
          icon={<Building2 aria-hidden />}
          title="Condomínios"
          description="Cadastre condomínios, veja os números de cada um e entre para administrar."
        />
      )}

      {dashboard && (
        <DashboardPanel
          dashboard={dashboard}
          canManageUsers={can(user, "USERS_MANAGE")}
          canManageUnits={can(user, "UNITS_MANAGE")}
          canManageSupport={can(user, "SUPPORT_MANAGE")}
        />
      )}

      <section aria-label="Atalhos" className="space-y-3">
        <h2 className="text-lg font-bold tracking-tight text-fg">
          Acesso rápido
        </h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-4">
          <Card className="flex h-full flex-col gap-4 border-dashed bg-surface-muted p-5 shadow-none">
            <span className="grid size-11 place-items-center rounded-full bg-brand text-brand-fg [&>svg]:size-5">
              <CalendarClock aria-hidden />
            </span>
            <span>
              <span className="flex items-center gap-2 font-bold text-fg">
                Reservas
                <span className="rounded-full bg-fg px-2 py-0.5 text-[10px] font-bold tracking-wide text-surface uppercase">
                  Em breve
                </span>
              </span>
              <span className="mt-0.5 block text-[13px] text-muted">
                Quadras, salão de festas e outros espaços.
              </span>
            </span>
          </Card>
          <Shortcut
            href="/notificacoes"
            icon={<Bell aria-hidden />}
            title="Notificações"
            description="Avisos e comunicados do condomínio."
          />
          {can(user, "NOTIFICATIONS_BROADCAST") ? (
            <Shortcut
              href="/comunicados"
              icon={<Megaphone aria-hidden />}
              title="Comunicados"
              description="Envie um aviso para os moradores."
            />
          ) : (
            <Shortcut
              href="/perfil"
              icon={<CircleUserRound aria-hidden />}
              title="Meu perfil"
              description="Foto, nome e dados de acesso."
            />
          )}
          <Shortcut
            href="/suporte"
            icon={<LifeBuoy aria-hidden />}
            title="Suporte"
            description="Tire dúvidas ou relate um problema."
          />
        </div>
      </section>
    </div>
  );
}
