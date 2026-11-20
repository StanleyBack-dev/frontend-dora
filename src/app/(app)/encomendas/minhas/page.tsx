import type { Metadata } from "next";
import { Package } from "lucide-react";
import {
  Card,
  EmptyState,
  PageHeader,
  Pagination,
  SegmentedNav,
} from "@/design-system";
import { ModuleUnavailable } from "@/features/access/components/ModuleUnavailable";
import { NoCondominium } from "@/features/condominiums/components/NoCondominium";
import { MyParcelCard } from "@/features/parcels/components/MyParcelCard";
import { parcelQrSvg } from "@/features/parcels/model/parcel-qr";
import { authed, getSessionUser } from "@/server/auth/current-user";
import { parcelsService } from "@/server/services/parcels.service";
import type { ParcelStatus } from "@/shared/contracts/parcels";
import {
  firstParam,
  pageParam,
  type RawSearchParams,
} from "@/shared/lib/search-params";

export const metadata: Metadata = { title: "Minhas encomendas" };

const BASE = "/encomendas/minhas";
const PAGE_SIZE = 10;
const WAITING: ParcelStatus[] = ["RECEIVED"];
const DONE: ParcelStatus[] = ["PICKED_UP", "RETURNED", "CANCELLED"];

// The resident's parcels: those waiting with the QR and the pickup code to
// show at the desk, and the history with the pickup receipts. A parcel
// registered for another resident by name is not listed (the API).
export default async function MyParcelsPage({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>;
}) {
  const user = await getSessionUser();
  if (!user.condominium) return <NoCondominium user={user} />;
  if (!user.condominium.modules.includes("PARCELS")) {
    return <ModuleUnavailable name="Encomendas" />;
  }

  const query = await searchParams;
  const history = firstParam(query, "periodo") === "historico";
  const page = pageParam(query);
  const parcels = await authed((token) =>
    parcelsService.mine(token, history ? DONE : WAITING, {
      page,
      limit: PAGE_SIZE,
    }),
  );
  const qrs = await Promise.all(
    parcels.items.map((parcel) =>
      parcel.status === "RECEIVED" ? parcelQrSvg(parcel.pickupCode) : null,
    ),
  );
  const href = (target: number) =>
    `${BASE}?${history ? "periodo=historico&" : ""}page=${target}`;

  return (
    <>
      <PageHeader
        title="Minhas encomendas"
        description="O que chegou para você no condomínio: mostre o QR ou o código para retirar e assine na tela."
      />
      <SegmentedNav
        label="Encomendas"
        className="mb-4"
        items={[
          { label: "Aguardando retirada", href: BASE, active: !history },
          {
            label: "Histórico",
            href: `${BASE}?periodo=historico`,
            active: history,
          },
        ]}
      />

      {parcels.items.length === 0 ? (
        <Card>
          <EmptyState
            icon={<Package className="size-5" />}
            title={
              history ? "Nenhuma encomenda no histórico" : "Nada aguardando"
            }
            description={
              history
                ? "As encomendas retiradas, devolvidas ou canceladas aparecem aqui, com o comprovante de cada retirada."
                : "Quando chegar uma encomenda para você, ela aparece aqui com o código de retirada. Você também recebe um aviso no app e por e-mail."
            }
          />
        </Card>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {parcels.items.map((parcel, index) => (
              <MyParcelCard
                key={parcel.id}
                parcel={parcel}
                qrSvg={qrs[index]}
              />
            ))}
          </div>
          {parcels.totalPages > 1 && (
            <Card>
              <Pagination
                page={parcels.page}
                totalPages={parcels.totalPages}
                total={parcels.total}
                pageSize={PAGE_SIZE}
                hrefFor={href}
              />
            </Card>
          )}
        </div>
      )}
    </>
  );
}
