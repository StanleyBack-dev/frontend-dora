import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BackLink, Card, PageHeader } from "@/design-system";
import { AccessDenied } from "@/features/access/components/AccessDenied";
import { ModuleUnavailable } from "@/features/access/components/ModuleUnavailable";
import { NoCondominium } from "@/features/condominiums/components/NoCondominium";
import { FoundItemDesk } from "@/features/lost-and-found/components/FoundItemDesk";
import { FoundItemDetails } from "@/features/lost-and-found/components/FoundItemDetails";
import { foundItemOutcome } from "@/features/lost-and-found/model/found-item-labels";
import { SignatureReceiptView } from "@/features/signature/components/SignatureReceiptView";
import { getSessionUser } from "@/server/auth/current-user";
import { loadFoundItem } from "@/server/loaders/load-found-item";
import { requestTime } from "@/server/request-time";
import { can } from "@/shared/lib/access";

export const metadata: Metadata = { title: "Item achado" };

// One found item for the desk: its details (with what only the desk sees),
// the residents' claims and the actions while it is kept, and, once
// returned, the receipt (the signature and the evidence).
export default async function FoundItemPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getSessionUser();
  if (!user.condominium) return <NoCondominium user={user} />;
  if (!user.condominium.modules.includes("LOST_AND_FOUND")) {
    return <ModuleUnavailable name="Achados e perdidos" />;
  }
  if (!can(user, "LOST_FOUND_MANAGE")) return <AccessDenied />;
  const { id } = await params;
  const item = await loadFoundItem(id);
  if (!item) notFound();
  const now = (await requestTime()).getTime();

  return (
    <>
      <BackLink href="/achados-e-perdidos" label="Achados e perdidos" />
      <PageHeader
        title={item.title}
        description={foundItemOutcome(item) ?? undefined}
      />
      <div className="space-y-4">
        <Card className="p-4 sm:p-6">
          <FoundItemDetails item={item} now={now} />
        </Card>
        <FoundItemDesk item={item} />
        {item.returnReceipt && (
          <SignatureReceiptView
            title="Comprovante de devolução"
            signerLabel="Quem retirou"
            receipt={item.returnReceipt}
          />
        )}
      </div>
    </>
  );
}
