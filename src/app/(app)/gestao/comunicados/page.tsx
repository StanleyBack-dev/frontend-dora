import type { Metadata } from "next";
import { Card, CardBody, CardHeader, PageHeader } from "@/design-system";
import { AccessDenied } from "@/features/access/components/AccessDenied";
import { BroadcastForm } from "@/features/broadcasts/components/BroadcastForm";
import { BroadcastsSummary } from "@/features/broadcasts/components/BroadcastsSummary";
import { BroadcastHistoryItem } from "@/features/broadcasts/components/BroadcastHistoryItem";
import { authed, getSessionUser } from "@/server/auth/current-user";
import { broadcastsService } from "@/server/services/broadcasts.service";
import { can } from "@/shared/lib/access";

export const metadata: Metadata = { title: "Comunicados" };

export default async function BroadcastsPage() {
  const user = await getSessionUser();
  if (!can(user, "NOTIFICATIONS_BROADCAST")) return <AccessDenied />;

  const [history, stats] = await authed((token) =>
    Promise.all([
      broadcastsService.list(token),
      broadcastsService.stats(token),
    ]),
  );

  return (
    <>
      <PageHeader
        title="Comunicados"
        description="Avisos para todo o condomínio ou para um grupo de acesso. Chegam no app, nos aparelhos com notificação e, se quiser, por e-mail."
      />
      <BroadcastsSummary stats={stats} />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <BroadcastForm />
        <Card>
          <CardHeader title="Enviados" description="Os 50 mais recentes." />
          <CardBody>
            {history.length === 0 ? (
              <p className="text-sm text-muted">
                Nenhum comunicado enviado ainda.
              </p>
            ) : (
              <ul className="divide-y divide-border">
                {history.map((item) => (
                  <BroadcastHistoryItem key={item.id} item={item} />
                ))}
              </ul>
            )}
          </CardBody>
        </Card>
      </div>
    </>
  );
}
