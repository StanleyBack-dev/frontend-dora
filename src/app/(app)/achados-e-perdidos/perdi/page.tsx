import type { Metadata } from "next";
import { PageHeader, Pagination } from "@/design-system";
import { ModuleUnavailable } from "@/features/access/components/ModuleUnavailable";
import { NoCondominium } from "@/features/condominiums/components/NoCondominium";
import { MyLostReports } from "@/features/lost-and-found/components/MyLostReports";
import { authed, getSessionUser } from "@/server/auth/current-user";
import { lostReportsService } from "@/server/services/lost-reports.service";
import {
  buildHref,
  PAGE_SIZES,
  pageParam,
  pageSizeParam,
  pageSizeQuery,
  type RawSearchParams,
} from "@/shared/lib/search-params";

export const metadata: Metadata = { title: "Perdi algo" };

const BASE = "/achados-e-perdidos/perdi";

// "Perdi algo": the caller says what they lost and follows their reports
// (open ones first, paged by the API). When the desk registers an item of
// that category, they are told.
export default async function LostReportsPage({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>;
}) {
  const user = await getSessionUser();
  if (!user.condominium) return <NoCondominium user={user} />;
  if (!user.condominium.modules.includes("LOST_AND_FOUND")) {
    return <ModuleUnavailable name="Achados e perdidos" />;
  }
  const query = await searchParams;
  const page = pageParam(query);
  const pageSize = pageSizeParam(query);
  const reports = await authed((token) =>
    lostReportsService.mine(token, { page, limit: pageSize }),
  );
  const hrefWith = (overrides: Record<string, string | number | undefined>) =>
    buildHref(BASE, { "por-pagina": pageSizeQuery(pageSize), ...overrides });

  return (
    <>
      <PageHeader
        title="Perdi algo"
        description="Conte o que perdeu no condomínio. Quando a portaria registrar um item parecido, você recebe um aviso."
      />
      <MyLostReports reports={reports.items} />
      <Pagination
        page={reports.page}
        totalPages={reports.totalPages}
        total={reports.total}
        pageSize={pageSize}
        hrefFor={(target) => hrefWith({ page: target })}
        pageSizes={PAGE_SIZES}
        pageSizeHref={(size) => hrefWith({ "por-pagina": size, page: 1 })}
      />
    </>
  );
}
