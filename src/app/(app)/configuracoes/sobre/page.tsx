import type { Metadata } from "next";
import { Globe, Server } from "lucide-react";
import {
  BackLink,
  Card,
  CardBody,
  CardHeader,
  PageHeader,
} from "@/design-system";
import { appInfoService } from "@/server/services/app-info.service";
import {
  APP_BUILD,
  versionLabel,
  type BuildInfo,
} from "@/shared/lib/app-version";
import { formatDateTime } from "@/shared/lib/datetime";

export const metadata: Metadata = { title: "Sobre o Dora" };

/** "Atualizado em 15/11/2026 às 02:45" (São Paulo time). */
function updatedLabel(build: BuildInfo | null): string {
  if (!build) return "Não foi possível consultar agora";
  if (!build.updatedAt) return "Data de atualização indisponível";
  return `Atualizado em ${formatDateTime(build.updatedAt).replace(", ", " às ")}`;
}

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
        <p className="text-xs text-muted">{updatedLabel(build)}</p>
      </div>
      <span className="shrink-0 font-mono text-sm font-semibold text-fg">
        {build ? versionLabel(build) : "—"}
      </span>
    </div>
  );
}

// Which versions are running, the web app (this build) and the API, and
// when each one was last updated. Handy when reporting a problem.
export default async function AboutPage() {
  const api = await appInfoService.api();

  return (
    <>
      <BackLink href="/configuracoes" label="Configurações" />
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
