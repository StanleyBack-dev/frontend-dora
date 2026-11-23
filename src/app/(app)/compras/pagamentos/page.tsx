import type { Metadata } from "next";
import {
  AutoFilterForm,
  Card,
  FilterActions,
  FilterCombobox,
  FilterPanel,
  FilterResults,
  FilterScope,
  PageHeader,
  Pagination,
} from "@/design-system";
import { AccessDenied } from "@/features/access/components/AccessDenied";
import { ModuleUnavailable } from "@/features/access/components/ModuleUnavailable";
import { NoCondominium } from "@/features/condominiums/components/NoCondominium";
import { PaymentBoardSummary } from "@/features/purchases/components/PaymentBoardSummary";
import { PaymentBoardTable } from "@/features/purchases/components/PaymentBoardTable";
import { requestCode } from "@/features/purchases/model/request-labels";
import { authed, getSessionUser } from "@/server/auth/current-user";
import { purchasePaymentsService } from "@/server/services/purchase-payments.service";
import { purchaseRequestsService } from "@/server/services/purchase-requests.service";
import type {
  InstallmentState,
  PaymentFilter,
} from "@/shared/contracts/purchase-orders";
import { can, canAny } from "@/shared/lib/access";
import {
  buildHref,
  DEFAULT_PAGE_SIZE,
  firstParam,
  oneOf,
  PAGE_SIZES,
  pageParam,
  pageSizeParam,
  pageSizeQuery,
  type RawSearchParams,
} from "@/shared/lib/search-params";

export const metadata: Metadata = { title: "Pagamentos" };

const BASE = "/compras/pagamentos";
const STAGES = {
  "a-pagar": ["OVERDUE", "OPEN"],
  vencidas: ["OVERDUE"],
  "vencem-em-7-dias": ["DUE_SOON"],
  pagas: ["PAID"],
  todas: null,
} as const satisfies Record<string, readonly InstallmentState[] | null>;
type StageKey = keyof typeof STAGES;
const DEFAULT_STAGE: StageKey = "a-pagar";

/**
 * Compras > Pagamentos (contas a pagar): the installments of every placed
 * order by due day, the unpaid ones by default. The management pays them
 * (with the proof), moves a due day or undoes a payment; the approvers
 * follow along.
 */
export default async function PaymentBoardPage({
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
  const options = await authed((token) =>
    purchaseRequestsService.filterOptions(token),
  );
  const stage =
    oneOf(firstParam(query, "situacao"), Object.keys(STAGES) as StageKey[]) ??
    DEFAULT_STAGE;
  const requestId = oneOf(
    firstParam(query, "solicitacao"),
    options.requests.map((request) => request.id),
  );
  const page = pageParam(query);
  const pageSize = pageSizeParam(query);
  const states = STAGES[stage];
  const filter: PaymentFilter = {
    ...(states && { states: [...states] }),
    ...(requestId && { requestId }),
  };
  const filtered = stage !== DEFAULT_STAGE || Boolean(requestId);
  const [overview, rows] = await Promise.all([
    authed((token) => purchasePaymentsService.overview(token)),
    authed((token) =>
      purchasePaymentsService.board(token, filter, { page, limit: pageSize }),
    ),
  ]);
  const hrefWith = (overrides: Record<string, string | number | undefined>) =>
    buildHref(BASE, {
      solicitacao: requestId,
      situacao: stage === DEFAULT_STAGE ? undefined : stage,
      "por-pagina": pageSizeQuery(pageSize),
      ...overrides,
    });

  return (
    <>
      <PageHeader
        title="Pagamentos"
        description="As parcelas a pagar aos fornecedores, pelo vencimento: registre cada pagamento com o comprovante."
      />
      <PaymentBoardSummary overview={overview} />
      <FilterScope>
        <FilterPanel hasActiveFilters={filtered}>
          <AutoFilterForm className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {pageSize !== DEFAULT_PAGE_SIZE && (
              <input type="hidden" name="por-pagina" value={pageSize} />
            )}
            <FilterCombobox
              label="Solicitação"
              name="solicitacao"
              defaultValue={requestId ?? ""}
              placeholder="Todas"
              options={options.requests.map((request) => ({
                value: request.id,
                label: `${requestCode(request.number)} · ${request.title}`,
              }))}
            />
            <FilterCombobox
              label="Situação"
              name="situacao"
              defaultValue={stage === DEFAULT_STAGE ? "" : stage}
              placeholder="A pagar"
              options={[
                { value: "vencidas", label: "Vencidas" },
                { value: "vencem-em-7-dias", label: "Vencem em 7 dias" },
                { value: "pagas", label: "Pagas" },
                { value: "todas", label: "Todas" },
              ]}
            />
            <FilterActions
              clearHref={BASE}
              hasActiveFilters={filtered}
              autoSubmit
            />
          </AutoFilterForm>
        </FilterPanel>
        <FilterResults>
          <Card>
            <PaymentBoardTable
              rows={rows.items}
              filtered={filtered}
              canManage={can(user, "PURCHASES_MANAGE")}
            />
            <Pagination
              page={rows.page}
              totalPages={rows.totalPages}
              total={rows.total}
              pageSize={pageSize}
              hrefFor={(target) => hrefWith({ page: target })}
              pageSizes={PAGE_SIZES}
              pageSizeHref={(size) => hrefWith({ "por-pagina": size, page: 1 })}
            />
          </Card>
        </FilterResults>
      </FilterScope>
    </>
  );
}
