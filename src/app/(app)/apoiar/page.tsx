import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { HeartHandshake } from "lucide-react";
import { Card, CardBody, PageHeader } from "@/design-system";
import { inviteQrSvg } from "@/features/bookings/model/invite-qr";
import { CopyPixButton } from "@/features/support-project/components/CopyPixButton";
import { pixReceiver } from "@/server/config/pix";
import { pixPayload } from "@/shared/lib/pix";

export const metadata: Metadata = { title: "Apoie o Dora" };

// A quiet page, reached only from the "Conta" menu: whoever wants to support
// the project scans the PIX QR code or copies the code. Off (404) while the
// receiver isn't configured.
export default async function SupportProjectPage() {
  const receiver = pixReceiver();
  if (!receiver) notFound();
  const payload = pixPayload(receiver);
  const qrSvg = await inviteQrSvg(payload);

  return (
    <>
      <PageHeader
        title="Apoie o Dora"
        description="Um projeto independente, feito para facilitar a vida no condomínio."
      />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <Card>
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
            <p className="text-sm text-soft">Obrigado por fazer parte!</p>
          </CardBody>
        </Card>

        <Card className="self-start">
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
