import type { Metadata } from "next";
import { BackLink, PageHeader, Pagination } from "@/design-system";
import { ModuleUnavailable } from "@/features/access/components/ModuleUnavailable";
import { NoCondominium } from "@/features/condominiums/components/NoCondominium";
import { MyFoundItemClaims } from "@/features/lost-and-found/components/MyFoundItemClaims";
import { authed, getSessionUser } from "@/server/auth/current-user";
import { lostAndFoundService } from "@/server/services/lost-and-found.service";
import {
  buildHref,
  PAGE_SIZES,
  pageParam,
  pageSizeParam,
  pageSizeQuery,
  type RawSearchParams,
} from "@/shared/lib/search-params";

export const metadata: Metadata = { title: "Meus pedidos de itens achados" };

const BASE = "/achados-e-perdidos/meus";

// The caller's claims for found items, newest first and paged by the API:
// where each stands, the desk's answer and, once handed back, the receipt.
export default async function MyFoundItemClaimsPage({
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
  const claims = await authed((token) =>
    lostAndFoundService.myClaims(token, { page, limit: pageSize }),
  );
  const hrefWith = (overrides: Record<string, string | number | undefined>) =>
    buildHref(BASE, { "por-pagina": pageSizeQuery(pageSize), ...overrides });

  return (
    <>
      <BackLink href="/achados-e-perdidos" label="Achados e perdidos" />
      <PageHeader
        title="Meus pedidos"
        description="Os itens achados que você disse serem seus e a resposta da portaria."
      />
      <MyFoundItemClaims claims={claims.items} />
      <Pagination
        page={claims.page}
        totalPages={claims.totalPages}
        total={claims.total}
        pageSize={pageSize}
        hrefFor={(target) => hrefWith({ page: target })}
        pageSizes={PAGE_SIZES}
        pageSizeHref={(size) => hrefWith({ "por-pagina": size, page: 1 })}
      />
    </>
  );
}
