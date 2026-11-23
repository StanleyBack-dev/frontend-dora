import { CATEGORIES } from "@/features/catalog/model/categories";
import { PURCHASE_PRIORITIES } from "@/features/purchases/model/request-labels";
import type {
  PurchaseRequestFilter,
  PurchaseRequestStatus,
} from "@/shared/contracts/purchase-requests";
import {
  buildHref,
  firstParam,
  oneOf,
  pageParam,
  pageSizeParam,
  pageSizeQuery,
  type RawSearchParams,
} from "@/shared/lib/search-params";

/** A board's "Situação" stages: their words in the address → statuses. */
export type BoardStages = Record<
  string,
  readonly PurchaseRequestStatus[] | null
>;

/**
 * What a purchases board reads from the address: the stage (the default
 * when none), the request, category and priority, the page; the API filter
 * from them, whether anything differs from the default and links keeping
 * them.
 */
export function readBoardQuery<S extends BoardStages>(
  basePath: string,
  query: RawSearchParams,
  stages: S,
  defaultStage: keyof S & string,
  requestIds: string[] | null,
) {
  const stage =
    oneOf(firstParam(query, "situacao"), Object.keys(stages)) ?? defaultStage;
  const requestId = requestIds
    ? oneOf(firstParam(query, "solicitacao"), requestIds)
    : undefined;
  const category = oneOf(firstParam(query, "categoria"), CATEGORIES);
  const priority = oneOf(firstParam(query, "prioridade"), PURCHASE_PRIORITIES);
  const page = pageParam(query);
  const pageSize = pageSizeParam(query);
  const statuses = stages[stage];
  const filter: PurchaseRequestFilter = {
    ...(statuses && { statuses: [...statuses] }),
    ...(requestId && { requestId }),
    ...(category && { category }),
    ...(priority && { priority }),
  };
  const filtered =
    stage !== defaultStage || [requestId, category, priority].some(Boolean);
  const hrefWith = (overrides: Record<string, string | number | undefined>) =>
    buildHref(basePath, {
      solicitacao: requestId,
      categoria: category,
      prioridade: priority,
      situacao: stage === defaultStage ? undefined : stage,
      "por-pagina": pageSizeQuery(pageSize),
      ...overrides,
    });
  return {
    values: {
      requestId,
      category,
      priority,
      stage: stage === defaultStage ? "" : stage,
    },
    page,
    pageSize,
    filter,
    filtered,
    hrefWith,
  };
}
