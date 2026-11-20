import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BackLink, Card, PageHeader } from "@/design-system";
import { ModuleUnavailable } from "@/features/access/components/ModuleUnavailable";
import { NoCondominium } from "@/features/condominiums/components/NoCondominium";
import { ParcelDetails } from "@/features/parcels/components/ParcelDetails";
import { ParcelReceiptView } from "@/features/parcels/components/ParcelReceiptView";
import {
  parcelOutcome,
  parcelSummary,
} from "@/features/parcels/model/parcel-labels";
import { getSessionUser } from "@/server/auth/current-user";
import { loadParcel } from "@/server/loaders/load-parcel";
import { can } from "@/shared/lib/access";

export const metadata: Metadata = { title: "Encomenda" };

// One parcel and, once picked up, its receipt (the signature and the
// evidence). The desk sees any parcel; a resident only those they may see.
export default async function ParcelPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getSessionUser();
  if (!user.condominium) return <NoCondominium user={user} />;
  if (!user.condominium.modules.includes("PARCELS")) {
    return <ModuleUnavailable name="Encomendas" />;
  }
  const { id } = await params;
  const parcel = await loadParcel(id);
  if (!parcel) notFound();

  const desk = can(user, "PARCELS_MANAGE");
  const outcome = parcelOutcome(parcel);

  return (
    <>
      <BackLink
        href={desk ? "/encomendas" : "/encomendas/minhas?periodo=historico"}
        label={desk ? "Encomendas" : "Minhas encomendas"}
      />
      <PageHeader
        title={parcelSummary(parcel)}
        description={outcome ?? undefined}
      />
      <div className="space-y-4">
        <Card className="p-4 sm:p-6">
          {/* The desk does not see a waiting parcel's code: the resident shows it. */}
          <ParcelDetails
            parcel={parcel}
            showCode={!desk || parcel.status !== "RECEIVED"}
          />
        </Card>
        {parcel.signature && <ParcelReceiptView receipt={parcel.signature} />}
      </div>
    </>
  );
}
