import type { Metadata } from "next";
import { PageHeader, Pagination, SegmentedNav } from "@/design-system";
import { AccessDenied } from "@/features/access/components/AccessDenied";
import { ModuleUnavailable } from "@/features/access/components/ModuleUnavailable";
import { NoCondominium } from "@/features/condominiums/components/NoCondominium";
import { FoundItemClaimsQueue } from "@/features/lost-and-found/components/FoundItemClaimsQueue";
import { authed, getSessionUser } from "@/server/auth/current-user";
import { lostAndFoundService } from "@/server/services/lost-and-found.service";
import { can } from "@/shared/lib/access";
import {
  buildHref,
  firstParam,
  PAGE_SIZES,
  pageParam,
  pageSizeParam,
  pageSizeQuery,
  type RawSearchParams,
} from "@/shared/lib/search-params";

export const metadata: Metadata = { title: "Pedidos para conferir" };

const BASE = "/achados-e-perdidos/pedidos";

// The desk's queue of claims (gate or administration): the open ones on
// kept items, the ones waiting first and oldest first, each with what it
// takes to check the owner and hand the item over; or every claim. Paged
// by the API.
export default async function FoundItemClaimsPage({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>;
}) {
  const user = await getSessionUser();
  if (!user.condominium) return <NoCondominium user={user} />;
  if (!user.condominium.modules.includes("LOST_AND_FOUND")) {
    return <ModuleUnavailable name="Achados e perdidos" />;
  }
  if (!can(user, "LOST_FOUND_MANAGE")) return <AccessDenied />;

  const query = await searchParams;
  const open = firstParam(query, "situacao") !== "todos";
  const page = pageParam(query);
  const pageSize = pageSizeParam(query);
  const claims = await authed((token) =>
    lostAndFoundService.claims(token, open, { page, limit: pageSize }),
  );
  const hrefWith = (overrides: Record<string, string | number | undefined>) =>
    buildHref(BASE, {
      situacao: open ? undefined : "todos",
      "por-pagina": pageSizeQuery(pageSize),
      ...overrides,
    });

  return (
    <>
      <PageHeader
        title="Pedidos para conferir"
        description="Moradores que disseram que um item é seu. Confira pessoalmente na portaria e devolva com assinatura."
      />
      <SegmentedNav
        label="Pedidos"
        className="mb-4"
        items={[
          {
            label: open ? `Para conferir (${claims.total})` : "Para conferir",
            href: BASE,
            active: open,
          },
          {
            label: "Todos os pedidos",
            href: `${BASE}?situacao=todos`,
            active: !open,
          },
        ]}
      />
      <FoundItemClaimsQueue
        claims={claims.items}
        open={open}
        viewerId={user.id}
      />
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
