import Link from "next/link";
import { HandHelping } from "lucide-react";
import { buttonClasses } from "@/design-system";

// The way from the kept items to the resident's own claims: on its own
// row, to the right, below the header (as the desk's main action).
export function MyClaimsLink() {
  return (
    <div className="mb-5 flex justify-end">
      <Link href="/achados-e-perdidos/meus" className={buttonClasses("brand")}>
        <HandHelping aria-hidden className="size-4" />
        Meus pedidos
      </Link>
    </div>
  );
}
