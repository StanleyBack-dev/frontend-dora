"use client";

import { useState } from "react";
import { Mail, MessageCircle, Share2 } from "lucide-react";
import { MoreActions } from "@/design-system";
import { purchaseQuotesClient } from "@/features/purchases/api/purchase-quotes.client";
import { DocumentEmailModal } from "@/features/purchases/components/DocumentEmailModal";
import { DocumentWhatsAppModal } from "@/features/purchases/components/DocumentWhatsAppModal";
import {
  quoteMapFileName,
  quoteShareMessage,
} from "@/features/purchases/model/quote-share";
import type { PurchaseQuote } from "@/shared/contracts/purchase-quotes";
import type { PurchaseRequest } from "@/shared/contracts/purchase-requests";

/**
 * "Compartilhar" beside the map's PDF: WhatsApp or e-mail, each with the
 * PDF attached and a message already written. Each dialog mounts when
 * chosen, so it starts from the current quotes.
 */
export function ShareQuoteMapMenu({
  request,
  quotes,
  className,
}: {
  request: PurchaseRequest;
  quotes: PurchaseQuote[];
  className?: string;
}) {
  const [channel, setChannel] = useState<"whatsapp" | "email" | null>(null);
  const message = quoteShareMessage(request, quotes);
  const fileName = quoteMapFileName(request);

  return (
    <>
      <MoreActions
        label="Compartilhar"
        variant="brand"
        icon={<Share2 aria-hidden className="size-4" />}
        className={className}
        actions={[
          {
            label: "WhatsApp",
            icon: <MessageCircle />,
            onSelect: () => setChannel("whatsapp"),
          },
          {
            label: "E-mail",
            icon: <Mail />,
            onSelect: () => setChannel("email"),
          },
        ]}
      />
      {channel === "whatsapp" && (
        <DocumentWhatsAppModal
          open
          path={`/purchases/requests/${request.id}/quote-map`}
          fileName={fileName}
          defaultMessage={message}
          onClose={() => setChannel(null)}
        />
      )}
      {channel === "email" && (
        <DocumentEmailModal
          open
          title="Enviar mapa por e-mail"
          sentTitle="Mapa de cotação enviado."
          fileName={fileName}
          defaultMessage={message}
          onClose={() => setChannel(null)}
          onSend={(input) =>
            purchaseQuotesClient.shareMapByEmail(request.id, input)
          }
        />
      )}
    </>
  );
}
