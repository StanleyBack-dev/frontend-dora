import Link from "next/link";
import { PackageX } from "lucide-react";
import { buttonClasses, Card, EmptyState } from "@/design-system";

// A page of an optional module (contracted apart) the condominium doesn't
// have turned on.
export function ModuleUnavailable({ name }: { name: string }) {
  return (
    <Card>
      <EmptyState
        icon={<PackageX className="size-5" />}
        title={`${name} não está disponível`}
        description="Este módulo não foi contratado pelo seu condomínio. Fale com a administração do condomínio para saber mais."
        action={
          <Link href="/inicio" className={buttonClasses("secondary")}>
            Voltar ao início
          </Link>
        }
      />
    </Card>
  );
}
