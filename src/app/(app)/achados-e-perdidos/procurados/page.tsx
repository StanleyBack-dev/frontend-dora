import type { Metadata } from "next";
import { PageHeader, Pagination, SegmentedNav } from "@/design-system";
import { ModuleUnavailable } from "@/features/access/components/ModuleUnavailable";
import { NoCondominium } from "@/features/condominiums/components/NoCondominium";
import { LostReportBoard } from "@/features/lost-and-found/components/LostReportBoard";
import { LostReportsTable } from "@/features/lost-and-found/components/LostReportsTable";
import { authed, getSessionUser } from "@/server/auth/current-user";
import { condominiumsService } from "@/server/services/condominiums.service";
import { lostAndFoundService } from "@/server/services/lost-and-found.service";
import { lostReportsService } from "@/server/services/lost-reports.service";
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

export const metadata: Metadata = { title: "Itens procurados" };

const BASE = "/achados-e-perdidos/procurados";

// What residents said they lost ("Perdi algo"). The desk (gate or
// administration) gets every report with who lost it and the details;
// everyone else gets the neighbours' board: the reports shared, without
// who, each with "Achei isso".
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
  return can(user, "LOST_FOUND_MANAGE") ? (
    <LostReportsDesk query={query} />
  ) : (
    <LostReportsBoardView query={query} />
  );
}

// The neighbours' board, newest first and paged by the API.
async function LostReportsBoardView({ query }: { query: RawSearchParams }) {
  const page = pageParam(query);
  const pageSize = pageSizeParam(query);
  const reports = await authed((token) =>
    lostReportsService.board(token, { page, limit: pageSize }),
  );
  const hrefWith = (overrides: Record<string, string | number | undefined>) =>
    buildHref(BASE, { "por-pagina": pageSizeQuery(pageSize), ...overrides });

  return (
    <>
      <PageHeader
        title="Itens procurados"
        description="O que os vizinhos perderam. Achou algum? Toque em “Achei isso” e deixe na portaria: quem perdeu é avisado."
      />
      <LostReportBoard reports={reports.items} />
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

// The desk's view: the open reports (newest first) or the closed ones,
// with who lost what. Paged by the API.
async function LostReportsDesk({ query }: { query: RawSearchParams }) {
  const open = firstParam(query, "situacao") !== "encerrados";
  const page = pageParam(query);
  const pageSize = pageSizeParam(query);
  const [reports, units, staff] = await Promise.all([
    authed((token) =>
      lostReportsService.list(token, open, { page, limit: pageSize }),
    ),
    authed((token) => condominiumsService.units(token)),
    authed((token) => lostAndFoundService.staff(token)),
  ]);
  const hrefWith = (overrides: Record<string, string | number | undefined>) =>
    buildHref(BASE, {
      situacao: open ? undefined : "encerrados",
      "por-pagina": pageSizeQuery(pageSize),
      ...overrides,
    });

  return (
    <>
      <PageHeader
        title="Itens procurados"
        description="O que moradores e funcionários avisaram que perderam. O item chegou à portaria? Toque em “Registrar item achado”: quem perdeu já fica indicado como dono e é avisado."
      />
      <SegmentedNav
        label="Avisos"
        className="mb-4"
        items={[
          {
            label: open ? `Procurando (${reports.total})` : "Procurando",
            href: BASE,
            active: open,
          },
          {
            label: "Encerrados",
            href: `${BASE}?situacao=encerrados`,
            active: !open,
          },
        ]}
      />
      <LostReportsTable
        reports={reports.items}
        open={open}
        units={units.map((unit) => ({ id: unit.id, label: unit.label }))}
        staff={staff}
      />
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
