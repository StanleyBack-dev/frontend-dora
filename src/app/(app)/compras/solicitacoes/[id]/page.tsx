import { redirect } from "next/navigation";

/**
 * Requests no longer have a page of their own: they open in the list (and
 * the quotes live on Cotações). Old links (notifications, e-mails) land on
 * the list showing that one request, already open.
 */
export default async function PurchaseRequestRedirect({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(
    `/compras/solicitacoes?solicitacao=${encodeURIComponent(id)}&situacao=todas`,
  );
}
