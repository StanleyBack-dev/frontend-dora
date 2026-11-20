"use client";

import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { ChevronDown, Search, X } from "lucide-react";
import {
  inputClasses,
  labelClasses,
  RequiredMark,
} from "@/design-system/components/Field";
import { Spinner } from "@/design-system/components/Spinner";
import { cn } from "@/design-system/utils/cn";

export type ComboboxOption = {
  value: string;
  label: string;
  description?: string;
};

type ComboboxProps = {
  label: string;
  hideLabel?: boolean;
  placeholder?: string;
  options: ComboboxOption[];
  /** Selected value (null = nothing selected). */
  value: string | null;
  /**
   * Text shown in the input while a value is selected and the list is closed
   * (default: the label of the selected option).
   */
  selectedLabel?: string;
  onSelect: (value: string | null) => void;
  /**
   * Called on every keystroke; the parent decides how to fetch options.
   * Without it, the list is filtered here by what was typed.
   */
  onInputChange?: (text: string) => void;
  loading?: boolean;
  emptyText?: string;
  footer?: string;
  disabled?: boolean;
  /** Marks the field with "*" (and aria-required). */
  required?: boolean;
  /**
   * Also accepts what was typed when it is not in the list (a carrier, a
   * place…): it shows first as an option, Enter or leaving the field keeps
   * it, and the value is that text.
   */
  freeText?: boolean;
  /**
   * With `freeText`: a last option (e.g. "Outro local (digitar)") that
   * clears the field for typing a value not in the list.
   */
  freeTextLabel?: string;
  /** Longest text typed (default 64). */
  maxLength?: number;
  className?: string;
};

/** The value of the "type another one" option (never selected as such). */
const FREE_TEXT = "__free_text__";

// Lowercase without accents, so "torre" finds "Tórre" and "bloco a" "Bloco A".
const normalize = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/s+/g, " ")
    .trim();

// Searchable select following the WAI-ARIA combobox pattern: type to narrow
// the list, ↑/↓ to move, Enter to pick, Esc to close.
export function Combobox({
  label,
  hideLabel = false,
  placeholder,
  options: allOptions,
  value,
  selectedLabel: selectedLabelProp,
  onSelect,
  onInputChange,
  loading = false,
  emptyText = "Nenhum resultado",
  footer,
  disabled = false,
  required = false,
  freeText = false,
  freeTextLabel,
  maxLength = 64,
  className,
}: ComboboxProps) {
  const id = useId();
  const listId = `${id}-list`;
  const rootRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [activeIndex, setActiveIndex] = useState(-1);
  // "Outro (digitar)" was chosen: the field waits for the typed value.
  const [typingFree, setTypingFree] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  // The parent filters (remote search) or, without onInputChange, we do.
  const filtered =
    onInputChange || !text.trim()
      ? allOptions
      : allOptions.filter((option) =>
          normalize(`${option.label} ${option.description ?? ""}`).includes(
            normalize(text),
          ),
        );
  // Free text: what was typed comes first, unless it is a listed option.
  const typed = text.trim();
  const options =
    freeText &&
    typed &&
    !allOptions.some((option) => normalize(option.label) === normalize(typed))
      ? [
          {
            value: typed,
            label: typed,
            description: "Usar o que foi digitado",
          },
          ...filtered,
        ]
      : typingFree
        ? []
        : freeText && freeTextLabel && !typed
          ? [...filtered, { value: FREE_TEXT, label: freeTextLabel }]
          : filtered;
  const selectedLabel =
    selectedLabelProp ??
    allOptions.find((option) => option.value === value)?.label ??
    (freeText && value ? value : undefined);
  /** What was typed: the listed option it names, or the text itself. */
  const typedValue = () =>
    allOptions.find((option) => normalize(option.label) === normalize(typed))
      ?.value ?? typed;

  // Close when clicking anywhere else.
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (rootRef.current?.contains(event.target as Node)) return;
      // Leaving with a typed text keeps it (free text).
      if (freeText && typed) choose(typedValue());
      else close();
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  });

  // Keep the highlighted option visible while navigating with the keyboard.
  useEffect(() => {
    if (activeIndex < 0) return;
    listRef.current
      ?.querySelector<HTMLElement>(`[data-index="${activeIndex}"]`)
      ?.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  function openList() {
    if (disabled) return;
    setOpen(true);
  }

  function close() {
    setOpen(false);
    setActiveIndex(-1);
    setTypingFree(false);
    if (text) {
      setText("");
      onInputChange?.("");
    }
  }

  function choose(next: string | null) {
    // "Outro (digitar)": nothing is chosen yet; the field takes the typing.
    if (next === FREE_TEXT) {
      setActiveIndex(-1);
      setTypingFree(true);
      inputRef.current?.focus();
      return;
    }
    close();
    if (next !== value) onSelect(next);
  }

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        openList();
        setActiveIndex((index) => Math.min(index + 1, options.length - 1));
        break;
      case "ArrowUp":
        event.preventDefault();
        setActiveIndex((index) => Math.max(index - 1, 0));
        break;
      case "Enter":
        if (open && activeIndex >= 0 && options[activeIndex]) {
          event.preventDefault();
          choose(options[activeIndex].value);
        } else if (open && freeText && typed) {
          event.preventDefault();
          choose(typedValue());
        }
        break;
      case "Escape":
        if (open) {
          event.preventDefault();
          close();
        }
        break;
    }
  }

  const inputValue = open ? text : (selectedLabel ?? "");
  const activeId =
    open && activeIndex >= 0 ? `${id}-option-${activeIndex}` : undefined;

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      <label htmlFor={id} className={cn(labelClasses, hideLabel && "sr-only")}>
        {label}
        {required && <RequiredMark />}
      </label>
      <div className="relative">
        <Search
          className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-soft"
          aria-hidden
        />
        <input
          ref={inputRef}
          id={id}
          type="text"
          role="combobox"
          aria-required={required || undefined}
          aria-expanded={open}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={activeId}
          autoComplete="off"
          spellCheck={false}
          maxLength={maxLength}
          disabled={disabled}
          placeholder={
            typingFree
              ? "Digite e tecle Enter"
              : value
                ? selectedLabel
                : placeholder
          }
          value={inputValue}
          onFocus={openList}
          onClick={openList}
          onKeyDown={onKeyDown}
          onChange={(event) => {
            setText(event.target.value);
            setActiveIndex(-1);
            openList();
            onInputChange?.(event.target.value);
          }}
          className={cn(
            inputClasses,
            "pr-16 pl-9",
            value && !open && "font-medium",
          )}
        />
        <div className="absolute top-1/2 right-2 flex -translate-y-1/2 items-center gap-1">
          {loading && (
            <Spinner size="sm" className="text-soft" label="Buscando" />
          )}
          {value && !disabled ? (
            <button
              type="button"
              aria-label="Limpar filtro"
              onClick={() => choose(null)}
              className="grid size-6 place-items-center rounded-sm text-soft hover:bg-surface-muted hover:text-fg"
            >
              <X className="size-3.5" />
            </button>
          ) : (
            <ChevronDown className="mr-1 size-4 text-soft" aria-hidden />
          )}
        </div>
      </div>

      {open && (
        <div className="absolute z-30 mt-1.5 w-full overflow-hidden rounded-xl border border-border bg-surface shadow-card">
          <ul
            ref={listRef}
            id={listId}
            role="listbox"
            aria-label={label}
            className="max-h-72 overflow-y-auto py-1"
          >
            {options.length === 0 ? (
              <li className="px-3 py-6 text-center text-sm text-muted">
                {loading
                  ? "Buscando…"
                  : typingFree
                    ? "Digite e tecle Enter (ou clique fora)"
                    : emptyText}
              </li>
            ) : (
              options.map((option, index) => {
                const selected = option.value === value;
                return (
                  <li
                    key={option.value}
                    id={`${id}-option-${index}`}
                    data-index={index}
                    role="option"
                    aria-selected={selected}
                    onPointerDown={(event) => event.preventDefault()}
                    onClick={() => choose(option.value)}
                    onPointerMove={() => setActiveIndex(index)}
                    className={cn(
                      "flex cursor-pointer flex-col px-3 py-2 text-sm",
                      index === activeIndex && "bg-surface-muted",
                      selected && "text-accent",
                    )}
                  >
                    <span className="truncate font-medium">{option.label}</span>
                    {option.description && (
                      <span className="truncate text-xs text-muted">
                        {option.description}
                      </span>
                    )}
                  </li>
                );
              })
            )}
          </ul>
          {footer && (
            <p className="border-t border-border px-3 py-2 text-xs text-soft">
              {footer}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
