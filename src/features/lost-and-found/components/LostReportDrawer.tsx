"use client";

import { useState, type FormEvent } from "react";
import { Camera, MapPin, Search, SearchX, Users } from "lucide-react";
import {
  Button,
  Combobox,
  DraftNotice,
  Drawer,
  DrawerActions,
  Field,
  CollapsibleSection,
  Select,
  TextArea,
  cn,
} from "@/design-system";
import { ItemPhotoPicker } from "@/features/lost-and-found/components/ItemPhotoPicker";
import { lostAndFoundClient } from "@/features/lost-and-found/api/lost-and-found.client";
import {
  COMMON_FOUND_PLACES,
  FOUND_ITEM_CATEGORIES,
  FOUND_ITEM_CATEGORY_LABELS,
} from "@/features/lost-and-found/model/found-item-labels";
import type {
  FoundItemCategory,
  LostReport,
} from "@/shared/contracts/lost-and-found";
import { useItemPhoto } from "@/features/lost-and-found/model/use-item-photo";
import { ApiClientError } from "@/shared/lib/api-client";
import { localDay } from "@/shared/lib/datetime";
import { sameShape } from "@/shared/lib/form-draft";
import { useFormDraft } from "@/shared/lib/use-form-draft";
import { useToast } from "@/shared/toast/useToast";

const FORM_ID = "lost-report-form";

type ReportDraft = {
  category: FoundItemCategory | "";
  title: string;
  description: string;
  lostLocation: string;
  /** date input value ("": not informed). */
  lostOn: string;
  /** Show it on the neighbours' board. */
  shared: boolean;
};

const EMPTY: ReportDraft = {
  category: "",
  title: "",
  description: "",
  lostLocation: "",
  lostOn: "",
  shared: true,
};

const parseDraft = (raw: unknown) => {
  const draft = sameShape(EMPTY, raw);
  if (draft?.category && !FOUND_ITEM_CATEGORIES.includes(draft.category)) {
    draft.category = "";
  }
  return draft;
};

// "Perdi algo": what was lost (category and what it is; where and when
// help the desk). When the desk registers an item of that category, the
// resident is told. Kept as a draft until sent or cancelled.
export function LostReportDrawer({
  open,
  onClose,
  onDone,
}: {
  open: boolean;
  onClose: () => void;
  onDone: (report: LostReport) => void;
}) {
  const { showError, showSuccess } = useToast();
  const draft = useFormDraft<ReportDraft>("lost-report", EMPTY, parseDraft, {
    open,
  });
  const form = draft.value;
  const itemPhoto = useItemPhoto();
  const [sending, setSending] = useState(false);
  // Today, read on events (never while rendering): the latest day accepted.
  const [today, setToday] = useState("");
  const refreshToday = () => setToday(localDay(new Date()));

  const set =
    <K extends keyof ReportDraft>(key: K) =>
    (value: ReportDraft[K]) =>
      draft.set((current) => ({ ...current, [key]: value }));

  const futureDay = form.lostOn !== "" && today !== "" && form.lostOn > today;
  const complete =
    !futureDay && form.category !== "" && form.title.trim().length >= 2;

  function cancel() {
    draft.discard();
    itemPhoto.drop();
    onClose();
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!form.category || !complete) return;
    setSending(true);
    try {
      const report = await lostAndFoundClient.reportLost({
        category: form.category,
        title: form.title.trim(),
        description: form.description.trim() || null,
        lostLocation: form.lostLocation.trim() || null,
        lostOn: form.lostOn || null,
        photo: itemPhoto.photo?.base64 ?? null,
        shared: form.shared,
      });
      showSuccess(
        "Aviso registrado.",
        form.shared
          ? "Ele aparece no mural dos vizinhos, e você é avisado quando a portaria registrar um item dessa categoria."
          : "Quando a portaria registrar um item dessa categoria, você é avisado.",
      );
      draft.discard();
      itemPhoto.drop();
      onDone(report);
    } catch (cause) {
      showError(
        cause instanceof ApiClientError
          ? cause.message
          : "Não foi possível registrar o aviso.",
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
      title="Perdi algo"
      subtitle="Conte o que perdeu. Quando a portaria achar algo parecido, você recebe um aviso."
      footer={
        <DrawerActions>
          <Button variant="cancel" onClick={cancel} disabled={sending}>
            Cancelar
          </Button>
          <Button
            type="submit"
            form={FORM_ID}
            loading={sending}
            disabled={!complete || itemPhoto.preparing}
            icon={<SearchX className="size-4" />}
          >
            Avisar que perdi
          </Button>
        </DrawerActions>
      }
    >
      <form id={FORM_ID} onSubmit={submit} className="space-y-4">
        {draft.restored && <DraftNotice onDiscard={draft.discard} />}

        <CollapsibleSection icon={<Search />} title="O que você perdeu">
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
            label="Detalhes (opcional)"
            maxLength={300}
            rows={2}
            placeholder="Cor, marca, tamanho… o que ajuda a reconhecer."
            value={form.description}
            onChange={(event) => set("description")(event.target.value)}
          />
        </CollapsibleSection>

        <CollapsibleSection icon={<MapPin />} title="Onde e quando (opcional)">
          <div className="grid items-start gap-3 sm:grid-cols-2">
            <Combobox
              label="Onde pode ter perdido"
              freeTextLabel="Outro local (digitar)"
              placeholder="Digite ou escolha"
              freeText
              maxLength={80}
              options={COMMON_FOUND_PLACES.map((value) => ({
                value,
                label: value,
              }))}
              value={form.lostLocation || null}
              onSelect={(value) => set("lostLocation")(value ?? "")}
            />
            <Field
              label="Quando"
              type="date"
              max={today || undefined}
              value={form.lostOn}
              error={futureDay ? "Não pode ser depois de hoje." : undefined}
              onFocus={refreshToday}
              onPointerDown={refreshToday}
              onChange={(event) => {
                refreshToday();
                set("lostOn")(event.target.value);
              }}
            />
          </div>
        </CollapsibleSection>

        <CollapsibleSection
          icon={<Camera />}
          title="Foto (opcional)"
          description="Tem uma foto do objeto, ou de um parecido? Ajuda a portaria a reconhecer."
        >
          <ItemPhotoPicker photo={itemPhoto} alt="Foto do que você perdeu" />
        </CollapsibleSection>

        <label
          className={cn(
            "flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition-colors",
            form.shared ? "border-brand/40 bg-brand-soft/60" : "border-border",
          )}
        >
          <input
            type="checkbox"
            className="mt-0.5 size-4 accent-[var(--accent)]"
            checked={form.shared}
            onChange={(event) => set("shared")(event.target.checked)}
          />
          <span>
            <span className="flex items-center gap-1.5 text-sm font-semibold text-fg">
              <Users aria-hidden className="size-4" />
              Mostrar para os vizinhos
            </span>
            <span className="block text-[13px] text-muted">
              Aparece no mural “Procurados” para quem achou poder avisar. Os
              vizinhos veem o que é, onde, quando e a foto; seu nome, sua
              unidade e os detalhes ficam só com a portaria. Desmarque para
              documentos ou objetos de valor.
            </span>
          </span>
        </label>
      </form>
    </Drawer>
  );
}
