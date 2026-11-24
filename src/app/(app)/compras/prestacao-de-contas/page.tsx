import type { Metadata } from "next";
import { ReceiptText } from "lucide-react";
import { Alert, Card, PageHeader, Pagination } from "@/design-system";
import { ModuleUnavailable } from "@/features/access/components/ModuleUnavailable";
import { NoCondominium } from "@/features/condominiums/components/NoCondominium";
import { PeriodFilter } from "@/features/purchases/components/PeriodFilter";
import { ReportPdfAction } from "@/features/purchases/components/ReportPdfAction";
import { SectionCard } from "@/features/purchases/components/SectionCard";
import { SpendCharts } from "@/features/purchases/components/SpendCharts";
import { TransparencyPurchasesTable } from "@/features/purchases/components/TransparencyPurchasesTable";
import { TransparencySummaryCards } from "@/features/purchases/components/TransparencySummaryCards";
import {
  periodLabel,
  periodQuery,
  readPeriod,
} from "@/features/purchases/model/indicator-labels";
import { authed, getSessionUser } from "@/server/auth/current-user";
import { purchaseIndicatorsService } from "@/server/services/purchase-indicators.service";
import { localDay } from "@/shared/lib/datetime";
import {
  buildHref,
  firstParam,
  PAGE_SIZES,
  pageParam,
  pageSizeParam,
  pageSizeQuery,
  type RawSearchParams,
} from "@/shared/lib/search-params";

export const metadata: Metadata = { title: "Prestação de contas" };

const BASE = "/compras/prestacao-de-contas";

/**
 * Compras > Prestação de contas: what the condominium spent on purchases in
 * a year or month, by category and month, and the purchases completed (the
 * supplier, the value, how many quotes). For every resident once the
 * approvers publish it; before that, only the management and the approvers
 * see it (with a notice), to check it.
 */
export default async function PurchaseTransparencyPage({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>;
}) {
  const user = await getSessionUser();
  if (!user.condominium) return <NoCondominium user={user} />;
  if (!user.condominium.modules.includes("PURCHASES")) {
    return <ModuleUnavailable name="Compras" />;
  }
  const status = await authed((token) =>
    purchaseIndicatorsService.transparencyStatus(token),
  );
  if (!status.enabled && !status.canPreview) {
    return <ModuleUnavailable name="Prestação de contas" />;
  }

  const query = await searchParams;
  const currentYear = Number(localDay(new Date()).slice(0, 4));
  const period = readPeriod(
    firstParam(query, "ano"),
    firstParam(query, "mes"),
    currentYear,
  );
  const page = pageParam(query);
  const pageSize = pageSizeParam(query);
  const { summary, purchases } = await authed((token) =>
    purchaseIndicatorsService.transparency(token, period, {
      page,
      limit: pageSize,
    }),
  );
  const hrefWith = (overrides: Record<string, string | number | undefined>) =>
    buildHref(BASE, {
      ano: period.year === currentYear ? undefined : period.year,
      mes: period.month ?? undefined,
      "por-pagina": pageSizeQuery(pageSize),
      ...overrides,
    });

  return (
    <>
      <PageHeader
        title="Prestação de contas"
        description={`O que o condomínio gastou em compras: ${periodLabel(period).toLowerCase()}. Conta o que foi pago no período.`}
      />
      <ReportPdfAction
        path={`/purchases/transparency/pdf?${periodQuery(period)}`}
        fallbackName="prestacao-de-contas-compras.pdf"
        label="Relatório em PDF"
      />
      {!status.enabled && (
        <Alert tone="info" className="mb-4">
          Ainda não publicada: só a gestão e os aprovadores veem esta página.
          Publique em Compras &gt; Indicadores.
        </Alert>
      )}
      <TransparencySummaryCards summary={summary} completed={purchases.total} />
      <div className="space-y-4">
        <PeriodFilter base={BASE} period={period} currentYear={currentYear} />
        <SpendCharts
          period={period}
          paidCents={summary.paidCents}
          byCategory={summary.byCategory}
          byMonth={summary.byMonth}
        />
        <SectionCard
          icon={<ReceiptText />}
          title="Compras concluídas"
          description="As que ficaram concluídas (recebidas e pagas) no período, da mais recente: fornecedor, valor e quantas cotações houve. O gasto acima conta os pagamentos feitos no período."
        >
          <Card className="-m-4 border-0 shadow-none sm:-m-6">
            <TransparencyPurchasesTable rows={purchases.items} />
            {purchases.total > 0 && (
              <Pagination
                page={purchases.page}
                totalPages={purchases.totalPages}
                total={purchases.total}
                pageSize={pageSize}
                hrefFor={(target) => hrefWith({ page: target })}
                pageSizes={PAGE_SIZES}
                pageSizeHref={(size) =>
                  hrefWith({ "por-pagina": size, page: 1 })
                }
              />
            )}
          </Card>
        </SectionCard>
      </div>
    </>
  );
}
