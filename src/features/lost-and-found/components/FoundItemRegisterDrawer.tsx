"use client";

import { useRef, useState, type FormEvent } from "react";
import { Camera, EyeOff, ImagePlus, PackagePlus, Trash2 } from "lucide-react";
import {
  Button,
  Combobox,
  DraftNotice,
  Drawer,
  Field,
  FormSection,
  Select,
  TextArea,
  cn,
} from "@/design-system";
import { lostAndFoundClient } from "@/features/lost-and-found/api/lost-and-found.client";
import {
  COMMON_FOUND_PLACES,
  COMMON_FOUND_STORAGE,
  FOUND_ITEM_CATEGORIES,
  FOUND_ITEM_CATEGORY_LABELS,
  hidesPhotoByDefault,
} from "@/features/lost-and-found/model/found-item-labels";
import {
  PhotoError,
  prepareSpacePhoto,
  SPACE_PHOTO_ACCEPT,
  type PreparedPhoto,
} from "@/features/spaces/model/space-photo-file";
import type {
  FoundItem,
  FoundItemCategory,
} from "@/shared/contracts/lost-and-found";
import { ApiClientError } from "@/shared/lib/api-client";
import { fromLocalInput } from "@/shared/lib/datetime";
import { sameShape } from "@/shared/lib/form-draft";
import { useFormDraft } from "@/shared/lib/use-form-draft";
import { useToast } from "@/shared/toast/useToast";

const FORM_ID = "found-item-register-form";
/** What the API accepts for a photo (bytes). */
const PHOTO_MAX_BYTES = 1_000_000;

const asOptions = (values: readonly string[]) =>
  values.map((value) => ({ value, label: value }));

type RegisterDraft = {
  category: FoundItemCategory | "";
  title: string;
  description: string;
  privateDetails: string;
  foundLocation: string;
  /** datetime-local value ("" : now). */
  foundAt: string;
  storageLocation: string;
  /** null: the category's default (hidden only for documents). */
  photoHidden: boolean | null;
};

const EMPTY: RegisterDraft = {
  category: "",
  title: "",
  description: "",
  privateDetails: "",
  foundLocation: "",
  foundAt: "",
  storageLocation: "",
  photoHidden: null,
};

const parseDraft = (raw: unknown) => {
  const draft = sameShape(EMPTY, raw);
  if (
    draft &&
    draft.category &&
    !FOUND_ITEM_CATEGORIES.includes(draft.category)
  ) {
    draft.category = "";
  }
  return draft;
};

// Registers an item found in the condominium (gate or administration):
// what it is, where and when it was found, where it was kept and, if
// wanted, a photo. Details that prove the owner stay with the desk; a
// document's photo is hidden from the residents unless changed here. The
// texts are kept as a draft until registered or cancelled.
export function FoundItemRegisterDrawer({
  open,
  onClose,
  onDone,
}: {
  open: boolean;
  onClose: () => void;
  onDone: (item: FoundItem) => void;
}) {
  const { showError, showSuccess } = useToast();
  const draft = useFormDraft<RegisterDraft>(
    "found-item-register",
    EMPTY,
    parseDraft,
    { open },
  );
  const form = draft.value;
  const [photo, setPhoto] = useState<PreparedPhoto | null>(null);
  const [preparing, setPreparing] = useState(false);
  const [sending, setSending] = useState(false);
  const cameraInput = useRef<HTMLInputElement>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  const set =
    <K extends keyof RegisterDraft>(key: K) =>
    (value: RegisterDraft[K]) =>
      draft.set((current) => ({ ...current, [key]: value }));

  const photoHidden =
    form.photoHidden ??
    (form.category ? hidesPhotoByDefault(form.category) : false);

  const complete =
    form.category !== "" &&
    form.title.trim().length >= 2 &&
    form.foundLocation.trim().length >= 2 &&
    form.storageLocation.trim().length >= 2;

  function dropPhoto() {
    setPhoto((current) => {
      if (current) URL.revokeObjectURL(current.previewUrl);
      return null;
    });
  }

  function cancel() {
    draft.discard();
    dropPhoto();
    onClose();
  }

  async function pick(input: HTMLInputElement) {
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
    if (!form.category || !complete) return;
    const foundAt = form.foundAt ? fromLocalInput(form.foundAt) : null;
    if (foundAt && new Date(foundAt).getTime() > Date.now()) {
      return showError("A data em que foi achado não pode ser no futuro.");
    }
    setSending(true);
    try {
      const item = await lostAndFoundClient.register({
        category: form.category,
        title: form.title.trim(),
        description: form.description || null,
        privateDetails: form.privateDetails || null,
        foundLocation: form.foundLocation.trim(),
        foundAt,
        storageLocation: form.storageLocation.trim(),
        photo: photo?.base64 ?? null,
        photoHidden: photo ? photoHidden : null,
      });
      showSuccess(
        "Item registrado.",
        "Ele aparece para os moradores, que podem pedir se for deles.",
      );
      draft.discard();
      dropPhoto();
      onDone(item);
    } catch (cause) {
      showError(
        cause instanceof ApiClientError
          ? cause.message
          : "Não foi possível registrar o item.",
      );
    } finally {
      setSending(false);
    }
  }

  return (
    <Drawer
      open={open}
      onClose={onClose}
      busy={sending}
      title="Registrar item achado"
      subtitle="Fica guardado por 90 dias. Os moradores veem o item e pedem se for deles."
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
            Registrar item
          </Button>
        </div>
      }
    >
      <form id={FORM_ID} onSubmit={submit} className="space-y-6">
        {draft.restored && <DraftNotice onDiscard={draft.discard} />}

        <FormSection title="O item">
          <div className="grid items-start gap-3 sm:grid-cols-2">
            <Select
              label="Categoria"
              required
              value={form.category}
              onChange={(event) =>
                set("category")(event.target.value as FoundItemCategory)
              }
              options={[
                { value: "", label: "Escolha" },
                ...FOUND_ITEM_CATEGORIES.map((value) => ({
                  value,
                  label: FOUND_ITEM_CATEGORY_LABELS[value],
                })),
              ]}
            />
            <Field
              label="O que é"
              required
              maxLength={80}
              autoComplete="off"
              placeholder="Ex.: chave com chaveiro azul"
              value={form.title}
              onChange={(event) => set("title")(event.target.value)}
            />
          </div>
          <TextArea
            label="Descrição para os moradores"
            maxLength={300}
            rows={2}
            placeholder="Cor, marca, tamanho… sem os detalhes que só o dono saberia."
            value={form.description}
            onChange={(event) => set("description")(event.target.value)}
          />
          <TextArea
            label="Detalhes para conferir o dono (só a portaria vê)"
            maxLength={300}
            rows={2}
            placeholder="Ex.: o que tem dentro, nome no documento, adesivo no verso."
            value={form.privateDetails}
            onChange={(event) => set("privateDetails")(event.target.value)}
          />
        </FormSection>

        <FormSection title="Onde e quando">
          <div className="grid items-start gap-3 sm:grid-cols-2">
            <Combobox
              label="Onde foi achado"
              freeTextLabel="Outro local (digitar)"
              required
              placeholder="Digite ou escolha"
              freeText
              maxLength={80}
              options={asOptions(COMMON_FOUND_PLACES)}
              value={form.foundLocation || null}
              onSelect={(value) => set("foundLocation")(value ?? "")}
            />
            <Field
              label="Quando (vazio: agora)"
              type="datetime-local"
              value={form.foundAt}
              onChange={(event) => set("foundAt")(event.target.value)}
            />
          </div>
          <Combobox
            label="Onde ficou guardado"
            freeTextLabel="Outro local (digitar)"
            required
            placeholder="Digite ou escolha"
            freeText
            maxLength={60}
            options={asOptions(COMMON_FOUND_STORAGE)}
            value={form.storageLocation || null}
            onSelect={(value) => set("storageLocation")(value ?? "")}
          />
        </FormSection>

        <FormSection
          title="Foto (opcional)"
          description="Ajuda o dono a reconhecer o item."
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
                alt="Foto do item"
                className="h-32 w-32 rounded-xl border border-border object-cover"
              />
              <Button
                size="sm"
                variant="secondary"
                icon={<Trash2 className="size-4" />}
                onClick={dropPhoto}
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
                onClick={() => cameraInput.current?.click()}
              >
                Tirar foto
              </Button>
              <Button
                variant="brand"
                disabled={preparing}
                icon={<ImagePlus className="size-4" />}
                onClick={() => fileInput.current?.click()}
              >
                Anexar foto
              </Button>
            </div>
          )}
          {photo && (
            <label
              className={cn(
                "flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition-colors",
                photoHidden
                  ? "border-warning-border bg-warning-soft"
                  : "border-border",
              )}
            >
              <input
                type="checkbox"
                className="mt-0.5 size-4 accent-[var(--accent)]"
                checked={photoHidden}
                onChange={(event) => set("photoHidden")(event.target.checked)}
              />
              <span>
                <span className="flex items-center gap-1.5 text-sm font-semibold text-fg">
                  <EyeOff aria-hidden className="size-4" />
                  Esconder a foto dos moradores
                </span>
                <span className="block text-[13px] text-muted">
                  Só a portaria e a gestão veem. Já vem marcado para documentos,
                  que têm dados pessoais.
                </span>
              </span>
            </label>
          )}
        </FormSection>
      </form>
    </Drawer>
  );
}
