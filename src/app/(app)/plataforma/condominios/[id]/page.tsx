import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Building,
  ClipboardList,
  ShieldCheck,
  UsersRound,
} from "lucide-react";
import { Badge, Card, CardBody, PageHeader, StatCard } from "@/design-system";
import { CondominiumModules } from "@/features/condominiums/components/CondominiumModules";
import { CondominiumMembersPanel } from "@/features/platform/components/CondominiumMembersPanel";
import { EnterCondominiumButton } from "@/features/platform/components/EnterCondominiumButton";
import { AccessDenied } from "@/features/access/components/AccessDenied";
import { authed, getSessionUser } from "@/server/auth/current-user";
import { canRunPlatform } from "@/shared/lib/access";
import { loadCondominium } from "@/server/loaders/load-condominium";
import { platformService } from "@/server/services/platform.service";
import {
  formatDateTime,
  formatNumber,
  formatRelative,
} from "@/shared/lib/format";
import { maskCnpj } from "@/shared/lib/masks";

export const metadata: Metadata = { title: "Condomínio" };

// One condominium seen from the platform, without entering it: its data,
// numbers, the modules it contracted (switched here) and its people. To
// change anything inside, "Entrar na gestão" opens its management.
export default async function PlatformCondominiumPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getSessionUser();
  // Next renders the page alongside its layout: it checks again.
  if (!canRunPlatform(user)) return <AccessDenied />;
  const condominium = await loadCondominium((await params).id);
  if (!condominium) notFound();
  const members = await authed((token) =>
    platformService.members(token, condominium.id),
  );

  return (
    <>
      <Link
        href="/plataforma/condominios"
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted hover:text-fg"
      >
        <ArrowLeft className="size-4" /> Condomínios
      </Link>
      <PageHeader
        title={condominium.name}
        description={`${condominium.city}/${condominium.state} · no Dora desde ${formatDateTime(condominium.createdAt)}`}
        actions={
          <EnterCondominiumButton
            condominiumId={condominium.id}
            current={user.condominium?.id === condominium.id}
          />
        }
      />

      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          <StatCard
            label="Membros ativos"
            value={formatNumber(condominium.activeMembers)}
            icon={<UsersRound />}
          />
          <StatCard
            label="Gestores"
            value={formatNumber(condominium.managers)}
            hint={condominium.managers === 0 ? "Sem gestor" : undefined}
            icon={<ShieldCheck />}
            tone={condominium.managers === 0 ? "warning" : "brand"}
          />
          <StatCard
            label="Unidades"
            value={formatNumber(condominium.units)}
            icon={<Building />}
          />
          <StatCard
            label="Cadastros pendentes"
            value={formatNumber(condominium.pendingEnrollments)}
            icon={<ClipboardList />}
          />
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardBody className="space-y-3 text-sm">
              <h2 className="text-sm font-semibold text-fg">Dados</h2>
              <dl className="grid grid-cols-[8rem_minmax(0,1fr)] gap-x-3 gap-y-2">
                <dt className="text-muted">Situação</dt>
                <dd>
                  {condominium.status === "ACTIVE" ? (
                    <Badge tone="success">Ativo</Badge>
                  ) : (
                    <Badge tone="danger">Suspenso</Badge>
                  )}
                </dd>
                <dt className="text-muted">CNPJ</dt>
                <dd className="text-fg">
                  {condominium.document ? maskCnpj(condominium.document) : "—"}
                </dd>
                <dt className="text-muted">Moradias</dt>
                <dd className="text-fg">
                  {condominium.addressFormat === "HOUSE"
                    ? "Casas (rua, quadra e lote)"
                    : "Apartamentos (bloco e número)"}
                </dd>
                <dt className="text-muted">Último acesso</dt>
                <dd className="text-fg">
                  {condominium.lastActivityAt
                    ? formatRelative(condominium.lastActivityAt)
                    : "Ninguém entrou ainda"}
                </dd>
              </dl>
              <p className="text-xs text-soft">
                Para editar os dados ou suspender, use a lista de condomínios.
              </p>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <CondominiumModules condominium={condominium} />
            </CardBody>
          </Card>
        </div>

        <div>
          <h2 className="mb-3 text-lg font-bold tracking-tight text-fg">
            Pessoas
          </h2>
          <CondominiumMembersPanel members={members} />
        </div>
      </div>
    </>
  );
}
