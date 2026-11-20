"use client";

import { useRef, useState, type FormEvent } from "react";
import { Camera, ImagePlus, PackagePlus, Trash2 } from "lucide-react";
import {
  Button,
  Drawer,
  Field,
  FormSection,
  Combobox,
  TextArea,
} from "@/design-system";
import { parcelsClient } from "@/features/parcels/api/parcels.client";
import { ParcelRecipientPicker } from "@/features/parcels/components/ParcelRecipientPicker";
import {
  COMMON_CARRIERS,
  COMMON_STORAGE_PLACES,
  formatParcelCode,
} from "@/features/parcels/model/parcel-labels";
import {
  clearParcelDraft,
  saveParcelDraft,
  type ParcelRegisterDraft,
} from "@/features/parcels/model/parcel-register-draft";
import {
  PhotoError,
  prepareSpacePhoto,
  SPACE_PHOTO_ACCEPT,
  type PreparedPhoto,
} from "@/features/spaces/model/space-photo-file";
import type { Parcel } from "@/shared/contracts/parcels";
import { ApiClientError } from "@/shared/lib/api-client";
import { useToast } from "@/shared/toast/useToast";

const FORM_ID = "parcel-register-form";

const asOptions = (values: readonly string[]) =>
  values.map((value) => ({ value, label: value }));
/** What the API accepts for a parcel photo (bytes). */
const PHOTO_MAX_BYTES = 1_000_000;

/** The fields typed as text (the unit and the resident are picked). */
type TextField = Exclude<keyof ParcelRegisterDraft, "unitId" | "recipient">;

const EMPTY: ParcelRegisterDraft = {
  unitId: null,
  recipient: null,
  recipientName: "",
  carrier: "",
  trackingCode: "",
  storageLocation: "",
  notes: "",
};

// Registers a parcel that arrived (gate or administration): the unit (or
// the resident, by name), what the label says, the carrier and where it was
// kept (common ones listed, or typed) and, optionally, a photo (taken with the
// camera or attached from the gallery). The unit's residents get the pickup
// code.
export function ParcelRegisterDrawer({
  open,
  units,
  draft = null,
  onClose,
  onDone,
}: {
  open: boolean;
  /** What was typed before the page reloaded (see parcel-register-draft). */
  draft?: ParcelRegisterDraft | null;
  units: { id: string; label: string }[];
  /** `discarded`: "Cancelar" cleared the form (otherwise it is kept as a draft). */
  onClose: (discarded: boolean) => void;
  onDone: (parcel: Parcel) => void;
}) {
  const { showError, showSuccess } = useToast();
  const [form, setForm] = useState(draft ?? EMPTY);
  const [photo, setPhoto] = useState<PreparedPhoto | null>(null);
  const [preparing, setPreparing] = useState(false);
  const [sending, setSending] = useState(false);
  // Remounts the fields after a reset (their own state starts over too).
  const [formKey, setFormKey] = useState(0);
  // One input opens the camera, the other the gallery or files.
  const cameraInput = useRef<HTMLInputElement>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  // After a registration or a closing the form starts blank again (the
  // place where parcels are kept usually repeats, so it stays).
  function reset() {
    clearParcelDraft();
    setFormKey((key) => key + 1);
    setForm((current) => ({
      ...EMPTY,
      storageLocation: current.storageLocation,
    }));
    setPhoto((current) => {
      if (current) URL.revokeObjectURL(current.previewUrl);
      return null;
    });
  }

  // "Cancelar" clears the form; X, Esc or a tap outside only hide it, and
  // what was typed is still there when it opens again (a draft).
  function cancel() {
    reset();
    onClose(true);
  }

  // The unit, the carrier and where it is kept are required.
  const complete =
    Boolean(form.unitId) &&
    form.carrier.trim() !== "" &&
    form.storageLocation.trim() !== "";

  const set = (field: TextField) => (value: string) =>
    setForm((current) => ({ ...current, [field]: value }));

  // The phone may discard the page while the camera or gallery is open: the
  // texts are saved first, so the form comes back if it reloads.
  function openPicker(input: HTMLInputElement | null) {
    saveParcelDraft(form);
    input?.click();
  }

  async function pick(input: HTMLInputElement) {
    // Back from the camera or the gallery with the page intact.
    clearParcelDraft();
    const file = input.files?.[0];
    if (!file) return;
    setPreparing(true);
    try {
      const prepared = await prepareSpacePhoto(file, PHOTO_MAX_BYTES);
      setPhoto((current) => {
        if (current) URL.revokeObjectURL(current.previewUrl);
        return prepared;
      });
    } catch (cause) {
      showError(
        cause instanceof PhotoError
          ? cause.message
          : "Não foi possível usar esta foto.",
      );
    } finally {
      setPreparing(false);
      // The same photo can be picked again after removing it.
      input.value = "";
    }
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!form.unitId) return showError("Escolha a unidade da encomenda.");
    if (!form.carrier.trim()) {
      return showError("Informe a transportadora ou loja.");
    }
    if (!form.storageLocation.trim()) {
      return showError("Informe onde a encomenda ficou guardada.");
    }
    setSending(true);
    try {
      const parcel = await parcelsClient.register({
        unitId: form.unitId,
        recipientUserId: form.recipient?.userId ?? null,
        recipientName: form.recipientName || null,
        carrier: form.carrier || null,
        trackingCode: form.trackingCode || null,
        storageLocation: form.storageLocation || null,
        notes: form.notes || null,
        photo: photo?.base64 ?? null,
      });
      showSuccess(
        `Encomenda registrada: código ${formatParcelCode(parcel.pickupCode)}`,
        form.recipient
          ? `Só ${form.recipient.name} recebeu o aviso com o código de retirada.`
          : "Os moradores da unidade foram avisados com o código de retirada.",
      );
      reset();
      onDone(parcel);
    } catch (cause) {
      showError(
        cause instanceof ApiClientError
          ? cause.message
          : "Não foi possível registrar a encomenda.",
      );
    } finally {
      setSending(false);
    }
  }

  return (
    <Drawer
      open={open}
      onClose={() => {
        // Only a reload while picking a photo reopens it by itself.
        clearParcelDraft();
        onClose(false);
      }}
      busy={sending}
      title="Receber encomenda"
      subtitle="Os moradores da unidade recebem um aviso com o código de retirada."
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="cancel" onClick={cancel} disabled={sending}>
            Cancelar
          </Button>
          <Button
            type="submit"
            form={FORM_ID}
            loading={sending}
            disabled={!complete || preparing}
            icon={<PackagePlus className="size-4" />}
          >
            Registrar e avisar
          </Button>
        </div>
      }
    >
      <form key={formKey} id={FORM_ID} onSubmit={submit} className="space-y-6">
        <FormSection title="Para quem">
          <ParcelRecipientPicker
            units={units}
            value={form.unitId}
            initialResident={form.recipient}
            onChange={(pick) =>
              setForm((current) => ({
                ...current,
                unitId: pick?.unitId ?? null,
                // By name: only this resident is told (and sees it).
                recipient: pick?.resident ?? null,
                // Chosen by name: the label usually has that name.
                recipientName:
                  pick?.resident && !current.recipientName
                    ? pick.resident.name
                    : current.recipientName,
              }))
            }
          />
          <Field
            label="Destinatário (como está na etiqueta)"
            maxLength={120}
            autoComplete="off"
            value={form.recipientName}
            onChange={(event) => set("recipientName")(event.target.value)}
          />
        </FormSection>

        <FormSection title="A encomenda">
          <div className="grid items-start gap-3 sm:grid-cols-2">
            <Combobox
              label="Transportadora ou loja"
              freeTextLabel="Outros (digitar)"
              required
              placeholder="Digite ou escolha"
              freeText
              maxLength={60}
              options={asOptions(COMMON_CARRIERS)}
              value={form.carrier || null}
              onSelect={(value) => set("carrier")(value ?? "")}
            />
            <Field
              label="Código de rastreio"
              maxLength={60}
              autoComplete="off"
              spellCheck={false}
              value={form.trackingCode}
              onChange={(event) => set("trackingCode")(event.target.value)}
            />
          </div>
          <Combobox
            label="Onde ficou guardada"
            freeTextLabel="Outro local (digitar)"
            required
            placeholder="Digite ou escolha (ex.: prateleira 2)"
            freeText
            maxLength={60}
            options={asOptions(COMMON_STORAGE_PLACES)}
            value={form.storageLocation || null}
            onSelect={(value) => set("storageLocation")(value ?? "")}
          />
          <TextArea
            label="Observação"
            maxLength={300}
            rows={2}
            placeholder="Caixa grande, frágil, chegou molhada…"
            value={form.notes}
            onChange={(event) => set("notes")(event.target.value)}
          />
        </FormSection>

        <FormSection
          title="Foto (opcional)"
          description="Ajuda a encontrar o pacote e mostra como ele chegou."
        >
          <input
            ref={cameraInput}
            type="file"
            accept={SPACE_PHOTO_ACCEPT}
            capture="environment"
            className="hidden"
            onChange={(event) => void pick(event.target)}
          />
          <input
            ref={fileInput}
            type="file"
            accept={SPACE_PHOTO_ACCEPT}
            className="hidden"
            onChange={(event) => void pick(event.target)}
          />
          {photo ? (
            <div className="flex items-end justify-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element -- local preview */}
              <img
                src={photo.previewUrl}
                alt="Foto da encomenda"
                className="h-32 w-32 rounded-xl border border-border object-cover"
              />
              <Button
                size="sm"
                variant="secondary"
                icon={<Trash2 className="size-4" />}
                onClick={() =>
                  setPhoto((current) => {
                    if (current) URL.revokeObjectURL(current.previewUrl);
                    return null;
                  })
                }
              >
                Remover
              </Button>
            </div>
          ) : (
            <div className="mx-auto grid max-w-sm grid-cols-2 gap-2">
              <Button
                variant="brand"
                loading={preparing}
                icon={<Camera className="size-4" />}
                onClick={() => openPicker(cameraInput.current)}
              >
                Tirar foto
              </Button>
              <Button
                variant="brand"
                disabled={preparing}
                icon={<ImagePlus className="size-4" />}
                onClick={() => openPicker(fileInput.current)}
              >
                Anexar foto
              </Button>
            </div>
          )}
        </FormSection>
      </form>
    </Drawer>
  );
}
