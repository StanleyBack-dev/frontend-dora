import type { Metadata } from "next";
import { PageHeader } from "@/design-system";
import { AccessDenied } from "@/features/access/components/AccessDenied";
import { CondominiumPixForm } from "@/features/payments/components/CondominiumPixForm";
import { authed, getSessionUser } from "@/server/auth/current-user";
import { paymentsService } from "@/server/services/payments.service";
import { can } from "@/shared/lib/access";

export const metadata: Metadata = { title: "Pagamentos" };

// The condominium's PIX, for whoever manages payments.
export default async function PaymentsPage() {
  const user = await getSessionUser();
  if (!can(user, "PAYMENTS_MANAGE")) return <AccessDenied />;

  const pix = await authed((token) => paymentsService.condominiumPix(token));
  return (
    <>
      <PageHeader
        title="Pagamentos"
        description="O PIX do condomínio, que recebe os ingressos dos eventos."
      />
      <CondominiumPixForm pix={pix} />
    </>
  );
}
