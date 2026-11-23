import Link from "next/link";
import { ClipboardPlus } from "lucide-react";
import { buttonClasses } from "@/design-system";

/**
 * The page's main action: ask for a purchase (on its own row, to the
 * right, as on the parcels and lost-and-found desks).
 */
export function PurchaseRequestDeskActions() {
  return (
    <div className="mb-5 flex justify-end">
      <Link href="/compras/solicitacoes/nova" className={buttonClasses()}>
        <ClipboardPlus aria-hidden className="mr-1.5 size-4" />
        Nova solicitação
      </Link>
    </div>
  );
}
