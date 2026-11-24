import type { Metadata } from "next";
import { PageHeader } from "@/design-system";
import { AccessDenied } from "@/features/access/components/AccessDenied";
import { ModuleUnavailable } from "@/features/access/components/ModuleUnavailable";
import { NoCondominium } from "@/features/condominiums/components/NoCondominium";
import { IndicatorsSummary } from "@/features/purchases/components/IndicatorsSummary";
import { PeriodFilter } from "@/features/purchases/components/PeriodFilter";
import { ReportPdfAction } from "@/features/purchases/components/ReportPdfAction";
import { SpendCharts } from "@/features/purchases/components/SpendCharts";
import { SupplierProcessCards } from "@/features/purchases/components/SupplierProcessCards";
import { TransparencyCard } from "@/features/purchases/components/TransparencyCard";
import {
  periodLabel,
  periodQuery,
  readPeriod,
} from "@/features/purchases/model/indicator-labels";
import { authed, getSessionUser } from "@/server/auth/current-user";
import { purchaseIndicatorsService } from "@/server/services/purchase-indicators.service";
import { canAny } from "@/shared/lib/access";
import { localDay } from "@/shared/lib/datetime";
import { firstParam, type RawSearchParams } from "@/shared/lib/search-params";

export const metadata: Metadata = { title: "Indicadores de compras" };

const BASE = "/compras/indicadores";

/**
 * Compras > Indicadores: the purchases in figures for the management and the
 * approvers, for a year (the current one by default) or a month: what was
 * paid by category, month and supplier, what is still owed, how the process
 * went, a PDF of it all, and publishing the residents' accounts.
 */
export default async function PurchaseIndicatorsPage({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>;
}) {
  const user = await getSessionUser();
  if (!user.condominium) return <NoCondominium user={user} />;
  if (!user.condominium.modules.includes("PURCHASES")) {
    return <ModuleUnavailable name="Compras" />;
  }
  if (!canAny(user, "PURCHASES_MANAGE", "PURCHASES_APPROVE")) {
    return <AccessDenied />;
  }

  const query = await searchParams;
  const currentYear = Number(localDay(new Date()).slice(0, 4));
  const period = readPeriod(
    firstParam(query, "ano"),
    firstParam(query, "mes"),
    currentYear,
  );
  const [data, transparency] = await Promise.all([
    authed((token) => purchaseIndicatorsService.indicators(token, period)),
    authed((token) => purchaseIndicatorsService.transparencyStatus(token)),
  ]);

  return (
    <>
      <PageHeader
        title="Indicadores"
        description={`As compras em números: ${periodLabel(period).toLowerCase()}. O gasto conta as parcelas pagas no período.`}
      />
      <ReportPdfAction
        path={`/purchases/indicators/pdf?${periodQuery(period)}`}
        fallbackName="indicadores-de-compras.pdf"
        label="Relatório em PDF"
      />
      <IndicatorsSummary data={data} />
      <div className="space-y-4">
        <PeriodFilter base={BASE} period={period} currentYear={currentYear} />
        <SpendCharts
          period={period}
          paidCents={data.paidCents}
          byCategory={data.byCategory}
          byMonth={data.byMonth}
        />
        <SupplierProcessCards data={data} />
        <TransparencyCard status={transparency} />
      </div>
    </>
  );
}
