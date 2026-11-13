import type { Metadata } from "next";
import { Badge, Card, CardBody, CardHeader, PageHeader } from "@/design-system";
import { AccessDenied } from "@/features/access/components/AccessDenied";
import { GROUP_LABELS } from "@/features/access/model/access-labels";
import { RecordAuditButton } from "@/features/audit/components/RecordAudit";
import { BroadcastForm } from "@/features/broadcasts/components/BroadcastForm";
import { AUDIENCE_LABELS } from "@/features/broadcasts/model/broadcast-labels";
import { authed, getSessionUser } from "@/server/auth/current-user";
import { broadcastsService } from "@/server/services/broadcasts.service";
import { can } from "@/shared/lib/access";
import { formatShortDay, formatTime } from "@/shared/lib/datetime";

export const metadata: Metadata = { title: "Comunicados" };

export default async function BroadcastsPage() {
  const user = await getSessionUser();
  if (!can(user, "NOTIFICATIONS_BROADCAST")) return <AccessDenied />;

  const history = await authed((token) => broadcastsService.list(token));

  return (
    <>
      <PageHeader
        title="Comunicados"
        description="Avisos para todo o condomínio ou para um grupo de acesso. Chegam no app, nos aparelhos com notificação e, se quiser, por e-mail."
      />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <Card>
          <CardHeader title="Novo comunicado" />
          <CardBody>
            <BroadcastForm />
          </CardBody>
        </Card>
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
                  <li key={item.id} className="space-y-1 py-3 text-sm">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="flex-1 font-semibold text-fg">
                        {item.title}
                      </span>
                      <Badge tone="brand">
                        {item.audience === "GRUPO" && item.targetGroup
                          ? GROUP_LABELS[item.targetGroup]
                          : AUDIENCE_LABELS[item.audience]}
                      </Badge>
                      <RecordAuditButton
                        entity="broadcast"
                        id={item.id}
                        label={item.title}
                        createdAt={item.createdAt}
                      />
                    </div>
                    <p className="line-clamp-3 whitespace-pre-line text-muted">
                      {item.body}
                    </p>
                    <p className="text-xs text-soft">
                      {formatShortDay(item.createdAt)},{" "}
                      {formatTime(item.createdAt)} · {item.recipients}{" "}
                      {item.recipients === 1 ? "pessoa" : "pessoas"}
                      {item.sendEmail ? " · com e-mail" : ""}
                      {item.authorName ? ` · ${item.authorName}` : ""}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </CardBody>
        </Card>
      </div>
    </>
  );
}
