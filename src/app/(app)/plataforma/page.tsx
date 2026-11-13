import type { Metadata } from "next";
import { Building2, CircleCheck, UserPlus, Users } from "lucide-react";
import {
  Field,
  FilterActions,
  FilterPanel,
  PageHeader,
  Select,
  StatCard,
} from "@/design-system";
import { AccessDenied } from "@/features/access/components/AccessDenied";
import { CondominiumsConsole } from "@/features/condominiums/components/CondominiumsConsole";
import { authed, getSessionUser } from "@/server/auth/current-user";
import { condominiumsService } from "@/server/services/condominiums.service";
import { can } from "@/shared/lib/access";
import { formatNumber } from "@/shared/lib/format";
import {
  firstParam,
  oneOf,
  type RawSearchParams,
} from "@/shared/lib/search-params";

export const metadata: Metadata = { title: "Condomínios" };

const STATUSES = { ativos: "ACTIVE", suspensos: "SUSPENDED" } as const;

// Platform console: only the Dora administration (CONDOMINIUMS_MANAGE).
export default async function PlatformPage({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>;
}) {
  const user = await getSessionUser();
  if (!can(user, "CONDOMINIUMS_MANAGE")) return <AccessDenied />;

  const params = await searchParams;
  const search = firstParam(params, "busca")?.slice(0, 100) ?? "";
  const status = oneOf(firstParam(params, "situacao"), [
    "ativos",
    "suspensos",
  ] as const);

  const [condominiums, all] = await authed((token) =>
    Promise.all([
      condominiumsService.list(token, {
        search,
        status: status ? STATUSES[status] : undefined,
      }),
      search || status ? condominiumsService.list(token) : null,
    ]),
  );
  const totals = all ?? condominiums;
  const sum = (pick: (item: (typeof totals)[number]) => number) =>
    totals.reduce((total, item) => total + pick(item), 0);
  const filtered = Boolean(search || status);

  return (
    <>
      <PageHeader
        title="Condomínios"
        description="Todos os condomínios que usam o Dora: cadastre, acompanhe os números e entre em cada um para administrar."
      />

      <section
        aria-label="Resumo da plataforma"
        className="mb-6 grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4"
      >
        <StatCard
          label="Condomínios"
          value={formatNumber(totals.length)}
          hint={`${formatNumber(totals.filter((item) => item.status === "ACTIVE").length)} ativos`}
          icon={<Building2 className="size-5" />}
          tone="brand"
        />
        <StatCard
          label="Membros ativos"
          value={formatNumber(sum((item) => item.activeMembers))}
          hint="Em todos os condomínios"
          icon={<Users className="size-5" />}
          tone="neutral"
        />
        <StatCard
          label="Gestores"
          value={formatNumber(sum((item) => item.managers))}
          hint={`${formatNumber(totals.filter((item) => item.managers === 0).length)} sem gestor`}
          icon={<CircleCheck className="size-5" />}
          tone="neutral"
        />
        <StatCard
          label="Cadastros pendentes"
          value={formatNumber(sum((item) => item.pendingEnrollments))}
          hint="Aguardando os gestores"
          icon={<UserPlus className="size-5" />}
          tone={
            sum((item) => item.pendingEnrollments) > 0 ? "warning" : "neutral"
          }
        />
      </section>

      <FilterPanel hasActiveFilters={filtered}>
        <form role="search" className="grid gap-3 sm:grid-cols-3">
          <Field
            label="Buscar"
            name="busca"
            defaultValue={search}
            placeholder="Nome ou cidade"
          />
          <Select
            label="Situação"
            name="situacao"
            defaultValue={status ?? ""}
            placeholder="Todas"
            options={[
              { value: "ativos", label: "Ativos" },
              { value: "suspensos", label: "Suspensos" },
            ]}
          />
          <FilterActions clearHref="/plataforma" hasActiveFilters={filtered} />
        </form>
      </FilterPanel>

      <CondominiumsConsole
        condominiums={condominiums}
        currentId={user.condominium?.id ?? null}
        filtered={filtered}
      />
    </>
  );
}
