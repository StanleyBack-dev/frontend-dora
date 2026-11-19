import Link from "next/link";
import { House, PackageX } from "lucide-react";
import { BlockedScreen, buttonClasses } from "@/design-system";

// A page of an optional module (contracted apart) the condominium doesn't
// have turned on.
export function ModuleUnavailable({ name }: { name: string }) {
  return (
    <BlockedScreen
      icon={<PackageX aria-hidden className="size-7" />}
      eyebrow="Módulo não contratado"
      title={`${name} não está disponível`}
      description="Este módulo não foi contratado pelo seu condomínio. Fale com a administração do condomínio para saber mais."
      actions={
        <Link href="/inicio" className={buttonClasses("brand")}>
          <House aria-hidden className="size-4" />
          Voltar ao início
        </Link>
      }
    />
  );
}
