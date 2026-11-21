import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BackLink, Card, PageHeader } from "@/design-system";
import { ModuleUnavailable } from "@/features/access/components/ModuleUnavailable";
import { NoCondominium } from "@/features/condominiums/components/NoCondominium";
import { FoundItemCard } from "@/features/lost-and-found/components/FoundItemCard";
import { FoundItemClaimAction } from "@/features/lost-and-found/components/FoundItemClaimAction";
import { FoundItemDesk } from "@/features/lost-and-found/components/FoundItemDesk";
import { FoundItemDetails } from "@/features/lost-and-found/components/FoundItemDetails";
import { foundItemOutcome } from "@/features/lost-and-found/model/found-item-labels";
import { SignatureReceiptView } from "@/features/signature/components/SignatureReceiptView";
import { getSessionUser } from "@/server/auth/current-user";
import { loadFoundItem } from "@/server/loaders/load-found-item";
import { requestTime } from "@/server/request-time";
import { can } from "@/shared/lib/access";
import { firstParam, type RawSearchParams } from "@/shared/lib/search-params";

export const metadata: Metadata = { title: "Item achado" };

// One found item. The desk sees its details (with what only the desk
// sees), the claims and the actions while kept; a resident sees what the
// residents see and their own claim, with "É meu". Once returned, the
// receipt shows for the desk and for whoever it went back to.
export default async function FoundItemPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<RawSearchParams>;
}) {
  const user = await getSessionUser();
  if (!user.condominium) return <NoCondominium user={user} />;
  if (!user.condominium.modules.includes("LOST_AND_FOUND")) {
    return <ModuleUnavailable name="Achados e perdidos" />;
  }
  const { id } = await params;
  const item = await loadFoundItem(id);
  if (!item) notFound();
  const desk = can(user, "LOST_FOUND_MANAGE");
  const receipt = item.returnReceipt && (
    <SignatureReceiptView
      title="Comprovante de devolução"
      signerLabel="Quem retirou"
      receipt={item.returnReceipt}
    />
  );

  if (!desk) {
    return (
      <>
        <BackLink
          href={
            item.myClaim ? "/achados-e-perdidos/meus" : "/achados-e-perdidos"
          }
          label={item.myClaim ? "Meus pedidos" : "Achados e perdidos"}
        />
        <PageHeader title={item.title} />
        {/* Wide screens: the item beside its receipt (when there is one). */}
        <div
          className={
            receipt
              ? "grid items-start gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]"
              : "mx-auto max-w-xl"
          }
        >
          <div className="space-y-4">
            <FoundItemCard item={item} linked={false} />
            <FoundItemClaimAction item={item} />
          </div>
          {receipt}
        </div>
      </>
    );
  }

  const now = (await requestTime()).getTime();
  return (
    <>
      <BackLink href="/achados-e-perdidos" label="Achados e perdidos" />
      <PageHeader
        title={item.title}
        description={foundItemOutcome(item) ?? undefined}
      />
      <div className="space-y-4">
        <FoundItemDesk
          item={item}
          viewerId={user.id}
          returnClaimId={firstParam(await searchParams, "devolver") ?? null}
        >
          <FoundItemDetails item={item} now={now} />
        </FoundItemDesk>
        {receipt}
      </div>
    </>
  );
}
