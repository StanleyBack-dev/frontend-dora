"use client";

import { useState, type FormEvent } from "react";
import {
  Camera,
  EyeOff,
  MapPin,
  Package,
  PackagePlus,
  UserRound,
} from "lucide-react";
import {
  Button,
  Combobox,
  DraftNotice,
  Drawer,
  Field,
  CollapsibleSection,
  Select,
  TextArea,
  cn,
  DrawerActions,
} from "@/design-system";
import { lostAndFoundClient } from "@/features/lost-and-found/api/lost-and-found.client";
import {
  COMMON_FOUND_PLACES,
  COMMON_FOUND_STORAGE,
  FOUND_ITEM_CATEGORIES,
  FOUND_ITEM_CATEGORY_LABELS,
  hidesPhotoByDefault,
} from "@/features/lost-and-found/model/found-item-labels";
import { ItemPhotoPicker } from "@/features/lost-and-found/components/ItemPhotoPicker";
import { useItemPhoto } from "@/features/lost-and-found/model/use-item-photo";
import type {
  FoundItem,
  FoundItemCategory,
} from "@/shared/contracts/lost-and-found";
import { ApiClientError } from "@/shared/lib/api-client";
import { fromLocalInput, toLocalInput } from "@/shared/lib/datetime";
import {
  UnitOrResidentPicker,
  type ResidentOption,
  type StaffOption,
} from "@/features/residents/components/UnitOrResidentPicker";
import { sameShape } from "@/shared/lib/form-draft";
import { useFormDraft } from "@/shared/lib/use-form-draft";
import { useToast } from "@/shared/toast/useToast";

const FORM_ID = "found-item-register-form";
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
  /** Whose the desk knows it is (null: unknown). */
  ownerUnitId: string | null;
  ownerResident: ResidentOption | null;
  /** Or someone of the team (no unit). */
  ownerStaff: StaffOption | null;
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
  ownerUnitId: null,
  ownerResident: null,
  ownerStaff: null,
};

/** What a form opened from elsewhere starts with. */
export type RegisterPrefill = {
  /** Identifies the source (a report id): applied once per source. */
  key: string;
  /** The "Perdi algo" report it answers: it ends when registered. */
  lostReportId?: string;
  values: Partial<
    Pick<
      RegisterDraft,
      | "category"
      | "title"
      | "description"
      | "privateDetails"
      | "foundLocation"
      | "ownerUnitId"
      | "ownerResident"
      | "ownerStaff"
    >
  >;
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
  units,
  staff,
  prefill = null,
  onClose,
  onDone,
}: {
  open: boolean;
  /** The condominium's units, to say whose the item is. */
  units: { id: string; label: string }[];
  /** The team, to say an item is a staff member's (absent: not offered). */
  staff?: StaffOption[];
  /** Starts filled in (e.g. from a "Perdi algo" report); null: blank. */
  prefill?: RegisterPrefill | null;
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
  const itemPhoto = useItemPhoto();
  const { photo, preparing, drop: dropPhoto } = itemPhoto;
  const [sending, setSending] = useState(false);
  // The latest moment the date field accepts (now), refreshed whenever the
  // field is used: read on events, never while rendering.
  const [latest, setLatest] = useState("");
  const refreshLatest = () => setLatest(toLocalInput(new Date().toISOString()));
  // Remounts the owner picker after a reset or a restored draft.
  const [resets, setResets] = useState(0);
  // A new prefill replaces the form once, when the drawer opens with it
  // (state adjusted while rendering, as useFormDraft does).
  const [appliedPrefill, setAppliedPrefill] = useState<string | null>(null);
  if (open && prefill && prefill.key !== appliedPrefill) {
    setAppliedPrefill(prefill.key);
    // Not a restored draft: the report's data replaces it.
    draft.discard();
    draft.set({ ...EMPTY, ...prefill.values });
    setResets((count) => count + 1);
  } else if (!open && appliedPrefill !== null) {
    // A form filled in from a report is not a draft of the desk's own.
    setAppliedPrefill(null);
    draft.discard();
    dropPhoto();
  }

  const set =
    <K extends keyof RegisterDraft>(key: K) =>
    (value: RegisterDraft[K]) =>
      draft.set((current) => ({ ...current, [key]: value }));

  const photoHidden =
    form.photoHidden ??
    (form.category ? hidesPhotoByDefault(form.category) : false);

  const futureDate =
    form.foundAt !== "" && latest !== "" && form.foundAt > latest;

  const complete =
    !futureDate &&
    form.category !== "" &&
    form.title.trim().length >= 2 &&
    form.foundLocation.trim().length >= 2 &&
    form.storageLocation.trim().length >= 2;

  function cancel() {
    draft.discard();
    setResets((count) => count + 1);
    dropPhoto();
    onClose();
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
        ownerUnitId: form.ownerUnitId,
        ownerUserId:
          form.ownerResident?.userId ?? form.ownerStaff?.userId ?? null,
        lostReportId: prefill?.lostReportId ?? null,
      });
      showSuccess(
        prefill?.lostReportId
          ? "Item registrado e aviso encerrado como encontrado."
          : "Item registrado.",
        form.ownerStaff
          ? `Só ${form.ownerStaff.name} foi avisado e vê o item.`
          : form.ownerResident
            ? `Só ${form.ownerResident.name} foi avisado e vê o item.`
            : form.ownerUnitId
              ? "Os moradores da unidade foram avisados e veem o item."
              : "Ele aparece para os moradores, que podem pedir se for deles.",
      );
      draft.discard();
      setResets((count) => count + 1);
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
      subtitle="Fica guardado por 90 dias. Sabe de quem é? Indique e só a pessoa é avisada."
      footer={
        <DrawerActions>
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
        </DrawerActions>
      }
    >
      <form id={FORM_ID} onSubmit={submit} className="space-y-4">
        {draft.restored && <DraftNotice onDiscard={draft.discard} />}

        <CollapsibleSection
          icon={<UserRound />}
          title="De quem é? (opcional)"
          description="Se a portaria sabe de quem é, só a unidade, o morador ou o funcionário é avisado e vê o item."
        >
          <UnitOrResidentPicker
            key={`${resets}-${draft.restored ? "restored" : "blank"}`}
            name="found-item-owner-mode"
            optional
            units={units}
            value={form.ownerUnitId}
            initialResident={form.ownerResident}
            staff={staff}
            initialStaff={form.ownerStaff}
            notes={{
              none: "O item aparece para todos os moradores, que pedem se for deles.",
              unit: "Os moradores da unidade são avisados e só eles veem o item.",
              resident:
                "Só o morador escolhido é avisado e vê o item, já liberado para retirar.",
              staff:
                "Só o funcionário escolhido é avisado e vê o item, já liberado para retirar. Outra pessoa da equipe faz a entrega.",
            }}
            search={lostAndFoundClient.owners}
            onChange={(pick) =>
              draft.set((current) => ({
                ...current,
                ownerUnitId: pick?.unitId ?? null,
                ownerResident: pick?.resident ?? null,
                ownerStaff: null,
              }))
            }
            onStaffChange={(member) =>
              draft.set((current) => ({
                ...current,
                ownerUnitId: null,
                ownerResident: null,
                ownerStaff: member,
              }))
            }
          />
        </CollapsibleSection>

        <CollapsibleSection icon={<Package />} title="O item">
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
        </CollapsibleSection>

        <CollapsibleSection icon={<MapPin />} title="Onde e quando">
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
              max={latest || undefined}
              value={form.foundAt}
              error={futureDate ? "Não pode ser depois de agora." : undefined}
              onFocus={refreshLatest}
              onPointerDown={refreshLatest}
              onChange={(event) => {
                refreshLatest();
                set("foundAt")(event.target.value);
              }}
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
        </CollapsibleSection>

        <CollapsibleSection
          icon={<Camera />}
          title="Foto (opcional)"
          description="Ajuda o dono a reconhecer o item."
        >
          <ItemPhotoPicker photo={itemPhoto} alt="Foto do item" />
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
        </CollapsibleSection>
      </form>
    </Drawer>
  );
}
