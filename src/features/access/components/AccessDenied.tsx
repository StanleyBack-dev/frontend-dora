import Link from "next/link";
import { House, LifeBuoy, ShieldX } from "lucide-react";
import { BlockedScreen, buttonClasses } from "@/design-system";

// A page the person's role cannot open.
export function AccessDenied() {
  return (
    <BlockedScreen
      icon={<ShieldX aria-hidden className="size-7" />}
      eyebrow="Acesso restrito"
      title="Acesso não permitido"
      description="Você não tem permissão para ver esta página. Se precisar dela, fale com a administração do condomínio."
      actions={
        <>
          <Link href="/suporte" className={buttonClasses("secondary")}>
            <LifeBuoy aria-hidden className="size-4" />
            Falar com o suporte
          </Link>
          <Link href="/inicio" className={buttonClasses("brand")}>
            <House aria-hidden className="size-4" />
            Voltar ao início
          </Link>
        </>
      }
    />
  );
}
