import type { Metadata } from "next";
import { UserPlus } from "lucide-react";
import {
  AutoFilterForm,
  Card,
  EmptyState,
  FilterActions,
  FilterCombobox,
  FilterPanel,
  FilterResults,
  FilterScope,
  PageHeader,
  Pagination,
} from "@/design-system";
import { AccessDenied } from "@/features/access/components/AccessDenied";
import { EnrollmentRequestsTable } from "@/features/enrollment/components/EnrollmentRequestsTable";
import {
  ENROLLMENT_STATUS,
  ENROLLMENT_STATUSES,
} from "@/features/enrollment/model/enrollment-form";
import { authed, getSessionUser } from "@/server/auth/current-user";
import { condominiumsService } from "@/server/services/condominiums.service";
import { enrollmentService } from "@/server/services/enrollment.service";
import { assignableGroups, can } from "@/shared/lib/access";
import {
  buildHref,
  firstParam,
  oneOf,
  DEFAULT_PAGE_SIZE,
  PAGE_SIZES,
  pageParam,
  pageSizeParam,
  pageSizeQuery,
  type RawSearchParams,
} from "@/shared/lib/search-params";

export const metadata: Metadata = { title: "Cadastros" };

// "todas" shows every status; without the parameter, only pending ones.
const STATUS_OPTIONS = [...ENROLLMENT_STATUSES, "TODAS"] as const;

export default async function EnrollmentsPage({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>;
}) {
  const user = await getSessionUser();
  if (!can(user, "USERS_MANAGE")) return <AccessDenied />;

  const params = await searchParams;
  const situation =
    oneOf(firstParam(params, "situacao"), STATUS_OPTIONS) ?? "PENDENTE";
  const page = pageParam(params);
  const pageSize = pageSizeParam(params);
  // Every request: what the name and e-mail filters offer (only those).
  const options = await authed((token) =>
    enrollmentService.requestFilterOptions(token),
  );
  const requestId = oneOf(
    firstParam(params, "cadastro"),
    options.map((option) => option.id),
  );
  const email = oneOf(
    firstParam(params, "email"),
    options.map((option) => option.email),
  );
  const hrefWith = (overrides: Record<string, string | number | undefined>) =>
    buildHref("/gestao/cadastros", {
      cadastro: requestId,
      email,
      situacao: situation === "PENDENTE" ? undefined : situation,
      "por-pagina": pageSizeQuery(pageSize),
      ...overrides,
    });

  const [requests, units] = await authed((token) =>
    Promise.all([
      enrollmentService.requests(token, {
        status: situation === "TODAS" ? undefined : situation,
        requestId,
        email,
        page,
        limit: pageSize,
      }),
      condominiumsService.units(token),
    ]),
  );
  const filtered = Boolean(requestId || email) || situation !== "PENDENTE";
  const emails = [...new Set(options.map((option) => option.email))];

  return (
    <>
      <PageHeader
        title="Cadastros"
        description="Quem se cadastrou pelo link: confira a unidade e aprove ou recuse."
      />
      <FilterScope>
        <FilterPanel hasActiveFilters={filtered}>
          <AutoFilterForm className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {pageSize !== DEFAULT_PAGE_SIZE && (
              <input type="hidden" name="por-pagina" value={pageSize} />
            )}
            <FilterCombobox
              label="Nome"
              name="cadastro"
              defaultValue={requestId ?? ""}
              placeholder="Todos"
              options={options.map((option) => ({
                value: option.id,
                label: option.name,
              }))}
            />
            <FilterCombobox
              label="E-mail"
              name="email"
              defaultValue={email ?? ""}
              placeholder="Todos"
              options={emails.map((value) => ({ value, label: value }))}
            />
            <FilterCombobox
              label="Situação"
              name="situacao"
              defaultValue={situation}
              placeholder="Pendentes"
              options={[
                ...ENROLLMENT_STATUSES.map((value) => ({
                  value,
                  label: `${ENROLLMENT_STATUS[value].label}s`,
                })),
                { value: "TODAS", label: "Todas" },
              ]}
            />
            <FilterActions
              clearHref="/gestao/cadastros"
              hasActiveFilters={filtered}
              autoSubmit
            />
          </AutoFilterForm>
        </FilterPanel>
        <FilterResults>
          <Card>
            {requests.page.items.length === 0 ? (
              <EmptyState
                icon={<UserPlus className="size-5" />}
                title={
                  situation === "PENDENTE" && !(requestId || email)
                    ? "Nenhum cadastro aguardando"
                    : "Nenhum cadastro encontrado"
                }
                description={
                  situation === "PENDENTE" && !(requestId || email)
                    ? "Gere um código na aba Links de cadastro e envie para os moradores."
                    : "Tente outros filtros."
                }
              />
            ) : (
              <EnrollmentRequestsTable
                requests={requests.page.items}
                assignableGroups={assignableGroups(user.group)}
                units={units}
              />
            )}

            <Pagination
              page={requests.page.page}
              totalPages={requests.page.totalPages}
              total={requests.page.total}
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
