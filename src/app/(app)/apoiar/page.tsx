import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { HeartHandshake } from "lucide-react";
import { Card, CardBody, PageHeader } from "@/design-system";
import { inviteQrSvg } from "@/features/bookings/model/invite-qr";
import { CopyPixButton } from "@/features/support-project/components/CopyPixButton";
import { SupportersManager } from "@/features/support-project/components/SupportersManager";
import { SupportRankingCard } from "@/features/support-project/components/SupportRankingCard";
import type { RankingPeriod } from "@/features/support-project/model/support-labels";
import { authed, getSessionUser } from "@/server/auth/current-user";
import { pixReceiver } from "@/server/config/pix";
import { requestTime } from "@/server/request-time";
import { supportersService } from "@/server/services/supporters.service";
import { can } from "@/shared/lib/access";
import { pixPayload } from "@/shared/lib/pix";
import {
  buildHref,
  firstParam,
  oneOf,
  type RawSearchParams,
} from "@/shared/lib/search-params";

export const metadata: Metadata = { title: "Apoie o Dora" };

const PERIODS: readonly RankingPeriod[] = ["geral", "ano"];

// A quiet page, reached only from the "Conta" menu: whoever wants to support
// the project scans the PIX QR code or copies the code, and the ranking
// thanks who already did. The platform administrator records each
// contribution below it. Off (404) while the receiver isn't configured.
export default async function SupportProjectPage({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>;
}) {
  const receiver = pixReceiver();
  if (!receiver) notFound();

  const user = await getSessionUser();
  const manager = can(user, "SUPPORTERS_MANAGE");
  const params = await searchParams;
  const period = oneOf(firstParam(params, "periodo"), PERIODS) ?? "geral";
  const today = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
  }).format(await requestTime());
  const year = Number(today.slice(0, 4));

  const payload = pixPayload(receiver);
  const [qrSvg, ranking, supporters] = await Promise.all([
    inviteQrSvg(payload),
    authed((token) =>
      supportersService.ranking(token, period === "ano" ? year : null),
    ),
    manager ? authed((token) => supportersService.list(token)) : null,
  ]);

  const periods = PERIODS.map((value) => ({
    label: value === "geral" ? "Geral" : String(year),
    href: buildHref("/apoiar", {
      periodo: value === "geral" ? undefined : value,
    }),
    active: value === period,
  }));

  return (
    <>
      <PageHeader
        title="Apoie o Dora"
        description="Um projeto independente, feito para facilitar a vida no condomínio."
      />
      {/* Phones: one column with the Pix card right after "Por que apoiar?"
      (the left column dissolves into the grid and `order` places each card).
      Larger screens: the cards on the left, the Pix card on the right. */}
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="contents lg:block lg:min-w-0 lg:space-y-6">
          <Card className="order-1">
            <CardBody className="space-y-4 text-[15px] text-fg">
              <p className="flex items-center gap-2 font-semibold">
                <HeartHandshake aria-hidden className="size-5 text-brand" />
                Por que apoiar?
              </p>
              <p className="text-muted">
                O Dora é desenvolvido de forma independente. As contribuições
                ajudam a pagar servidores e a construir as próximas novidades,
                como novos tipos de espaço, relatórios e o aplicativo cada vez
                mais rápido.
              </p>
              <p className="text-muted">
                Contribuir é totalmente opcional e não muda nada no seu uso do
                app: qualquer valor ajuda, e você escolhe quanto no seu banco.
              </p>
              <p className="text-sm text-muted">
                Quer aparecer no ranking? Depois do Pix, envie o comprovante
                pelo{" "}
                <Link
                  href="/suporte"
                  className="font-medium text-brand-ink underline-offset-4 hover:underline"
                >
                  Suporte
                </Link>{" "}
                com o nome que deve aparecer, ou peça para ficar como anônimo.
              </p>
              <p className="text-sm text-soft">Obrigado por fazer parte!</p>
            </CardBody>
          </Card>

          <div className="order-3 min-w-0">
            <SupportRankingCard ranking={ranking} periods={periods} />
          </div>

          {supporters && (
            <div className="order-4 min-w-0">
              <SupportersManager supporters={supporters} today={today} />
            </div>
          )}
        </div>

        <Card className="order-2 self-start lg:order-none">
          <CardBody className="space-y-4 text-center">
            <p className="text-sm font-semibold text-fg">Pix</p>
            <div
              role="img"
              aria-label="QR code Pix para apoiar o Dora"
              className="mx-auto w-56 rounded-xl bg-white p-2 [&>svg]:h-auto [&>svg]:w-full"
              // Our own SVG, made by the qrcode library from the PIX code.
              dangerouslySetInnerHTML={{ __html: qrSvg }}
            />
            <p className="text-xs text-muted">
              Abra o app do seu banco, escolha Pix → Ler QR code. No celular,
              use o botão abaixo e cole em Pix → Copia e cola.
            </p>
            <CopyPixButton payload={payload} />
            <p className="text-xs text-soft">Recebedor: {receiver.name}</p>
          </CardBody>
        </Card>
      </div>
    </>
  );
}
