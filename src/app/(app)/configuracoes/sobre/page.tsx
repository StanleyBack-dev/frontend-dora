import type { Metadata } from "next";
import { Globe, Server } from "lucide-react";
import { Card, CardBody, CardHeader, PageHeader } from "@/design-system";
import { appInfoService } from "@/server/services/app-info.service";
import {
  APP_BUILD,
  versionLabel,
  type BuildInfo,
} from "@/shared/lib/app-version";

export const metadata: Metadata = { title: "Sobre o Dora" };

function BuildRow({
  icon,
  title,
  build,
}: {
  icon: React.ReactNode;
  title: string;
  build: BuildInfo | null;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border px-4 py-3">
      <span className="grid size-9 shrink-0 place-items-center rounded-md bg-accent-soft text-accent">
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-fg">{title}</p>
        <p className="text-xs text-muted">
          {build?.commit
            ? `Commit ${build.commit.slice(0, 7)}`
            : build
              ? "Ambiente de desenvolvimento"
              : "Não foi possível consultar agora"}
        </p>
      </div>
      <span className="shrink-0 font-mono text-sm font-semibold text-fg">
        {build ? versionLabel(build) : "—"}
      </span>
    </div>
  );
}

// Which versions are running: the web app (this build) and the API. Handy
// when reporting a problem to the support.
export default async function AboutPage() {
  const api = await appInfoService.api();

  return (
    <>
      <PageHeader
        title="Sobre o Dora"
        description="Versões em uso do aplicativo e do servidor."
      />
      <Card>
        <CardHeader
          title="Versões"
          description="Ao relatar um problema no Suporte, informe estas versões."
        />
        <CardBody className="space-y-3 pt-0">
          <BuildRow
            icon={<Globe className="size-4" aria-hidden />}
            title="Aplicativo"
            build={APP_BUILD}
          />
          <BuildRow
            icon={<Server className="size-4" aria-hidden />}
            title="Servidor (API)"
            build={api}
          />
          <p className="pt-1 text-xs text-soft">
            O Dora se atualiza sozinho: quando sai uma versão nova, o app avisa
            e basta tocar em “Atualizar agora”.
          </p>
        </CardBody>
      </Card>
    </>
  );
}
