"use client";

import { useState, type ComponentProps } from "react";
import { Field } from "@/design-system/components/Field";

// A typed filter of an AutoFilterForm (a search, a date): it applies itself
// (a search once the typing pauses, a date when picked). It follows the
// address: when the filters change by navigation ("Limpar filtros", back),
// it shows the new value, except while the person is typing in it.
export function FilterField({
  defaultValue = "",
  ...props
}: Omit<ComponentProps<typeof Field>, "value" | "onChange" | "defaultValue"> & {
  defaultValue?: string;
}) {
  const [value, setValue] = useState(defaultValue);
  const [synced, setSynced] = useState(defaultValue);
  const [focused, setFocused] = useState(false);
  if (defaultValue !== synced) {
    setSynced(defaultValue);
    if (!focused) setValue(defaultValue);
  }

  return (
    <Field
      {...props}
      value={value}
      onChange={(event) => setValue(event.target.value)}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
    />
  );
}
