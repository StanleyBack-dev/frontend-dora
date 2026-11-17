"use client";

import { useRef, useState } from "react";
import {
  Combobox,
  type ComboboxOption,
} from "@/design-system/components/Combobox";

// A filter field of an AutoFilterForm: a list to pick from where typing
// narrows the options. Picking (or clearing with the ×) applies the
// filter: the value goes into a hidden field of the form and the form is
// submitted. Nothing picked means "all" (the placeholder says so). It
// follows the address: when the filters change by navigation ("Limpar
// filtros", back), it shows the new value.
export function FilterCombobox({
  label,
  name,
  options,
  defaultValue = "",
  placeholder,
}: {
  label: string;
  /** The address parameter this filter sets. */
  name: string;
  options: ComboboxOption[];
  defaultValue?: string;
  /** What an empty field means ("Todos", "Todas"). */
  placeholder: string;
}) {
  const [value, setValue] = useState(defaultValue);
  const [synced, setSynced] = useState(defaultValue);
  if (defaultValue !== synced) {
    setSynced(defaultValue);
    setValue(defaultValue);
  }
  const hidden = useRef<HTMLInputElement>(null);

  function pick(next: string | null) {
    setValue(next ?? "");
    const input = hidden.current;
    if (!input) return;
    // Set it now (the form reads it before React re-renders) and submit.
    input.value = next ?? "";
    input.form?.requestSubmit();
  }

  return (
    <div>
      <input ref={hidden} type="hidden" name={name} value={value} readOnly />
      <Combobox
        label={label}
        placeholder={placeholder}
        options={options}
        value={value || null}
        onSelect={pick}
      />
    </div>
  );
}
