"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { QrCode, Save, Trash2 } from "lucide-react";
import {
  Button,
  CollapsibleSection,
  FormActions,
  FormIssues,
  Modal,
} from "@/design-system";
import { eventsClient } from "@/features/events/api/events.client";
import { pixFormOf } from "@/features/events/model/ticketing-form";
import {
  EMPTY_PIX_RECEIVER,
  PixReceiverFields,
  pixReceiverMissing,
  type PixReceiverForm,
} from "@/features/payments/components/PixReceiverFields";
import type { PixReceiver } from "@/shared/contracts/events";
import { ApiClientError } from "@/shared/lib/api-client";
import { useToast } from "@/shared/toast/useToast";

// The condominium's PIX: the key type, the key (masked and checked by its
// type), the receiver's name and city as the bank shows them. Paid events
// charge with it (unless an event has its own). The API checks it again and
// writes name and city the way the PIX code needs.
export function CondominiumPixForm({ pix }: { pix: PixReceiver | null }) {
  const router = useRouter();
  const { showError, showSuccess } = useToast();
  const [form, setForm] = useState<PixReceiverForm>(() => pixFormOf(pix));
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tried, setTried] = useState(false);
  const [removing, setRemoving] = useState(false);

  const missing = pixReceiverMissing(form);
  const saved = pixFormOf(pix);
  const dirty =
    !pix ||
    saved.keyType !== form.keyType ||
    saved.key !== form.key ||
    saved.name !== form.name ||
    saved.city !== form.city;

  async function submit(event: FormEvent) {
    event.preventDefault();
    setTried(true);
    if (missing.length > 0 || !form.keyType) return;
    setPending(true);
    setError(null);
    try {
      const stored = await eventsClient.setCondominiumPix({
        keyType: form.keyType,
        key: form.key.trim(),
        name: form.name.trim(),
        city: form.city.trim(),
      });
      setForm(pixFormOf(stored));
      showSuccess("PIX do condomínio salvo.");
      router.refresh();
    } catch (cause) {
      const message =
        cause instanceof ApiClientError
          ? cause.message
          : "Não foi possível salvar o PIX.";
      setError(message);
      showError(message);
    }
    setPending(false);
  }

  async function remove() {
    setPending(true);
    try {
      await eventsClient.removeCondominiumPix();
      setForm(EMPTY_PIX_RECEIVER);
      setRemoving(false);
      showSuccess("PIX do condomínio removido.");
      router.refresh();
    } catch (cause) {
      showError(
        cause instanceof ApiClientError
          ? cause.message
          : "Não foi possível remover o PIX.",
      );
    }
    setPending(false);
  }

  return (
    <form onSubmit={submit} className="space-y-4" noValidate>
      <FormIssues missing={tried ? missing : []} error={error} />
      <CollapsibleSection
        icon={<QrCode />}
        title="PIX do condomínio"
        description="Recebe os ingressos dos eventos pagos (cada evento pode usar outro)."
      >
        <PixReceiverFields value={form} onChange={setForm} />
        <p className="text-xs text-soft">
          No código PIX o nome vai sem acentos, em maiúsculas e com até 25
          letras; a cidade, com até 15. Cada pedido gera um PIX com o valor e o
          código do pedido, para achar o pagamento no extrato.
        </p>
      </CollapsibleSection>
      <FormActions>
        {pix && (
          <Button
            variant="cancel"
            icon={<Trash2 className="size-4" />}
            onClick={() => setRemoving(true)}
            disabled={pending}
          >
            Remover
          </Button>
        )}
        <Button
          type="submit"
          loading={pending}
          disabled={!dirty}
          icon={<Save className="size-4" />}
        >
          Salvar PIX
        </Button>
      </FormActions>
      <Modal
        open={removing}
        onClose={() => setRemoving(false)}
        title="Remover o PIX do condomínio?"
        footer={
          <>
            <Button variant="cancel" onClick={() => setRemoving(false)}>
              Cancelar
            </Button>
            <Button variant="danger" loading={pending} onClick={remove}>
              Remover
            </Button>
          </>
        }
      >
        Eventos pagos que usam o PIX do condomínio não poderão ser publicados
        até um novo cadastro. Pedidos já feitos continuam com o PIX que
        receberam.
      </Modal>
    </form>
  );
}
