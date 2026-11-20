"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import { KeyRound, ScanLine } from "lucide-react";
import { Button, Card, CardBody, Field } from "@/design-system";
import { QrScanButton } from "@/features/bookings/components/QrScanButton";

// The gate's main action: a code typed (or read from the QR): an invite or
// ticket to let in, or a parcel's pickup code. The field clears once the
// code was taken.
export function GateCodeForm({
  label,
  busy,
  disabled,
  onCode,
  title = "Liberar pelo código ou QR",
  actionLabel = "Liberar entrada",
  actionIcon = <KeyRound className="size-4" />,
  placeholder = "Ex.: ABCD EFGH",
  minLength = 8,
}: {
  label: string;
  busy: boolean;
  disabled: boolean;
  /** Takes the code; true when it worked (the field then clears). */
  onCode: (code: string) => Promise<boolean>;
  title?: string;
  actionLabel?: string;
  actionIcon?: ReactNode;
  placeholder?: string;
  /** Shortest code accepted (spaces and dashes aside). */
  minLength?: number;
}) {
  const [code, setCode] = useState("");

  async function take(value: string) {
    if (await onCode(value)) setCode("");
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    if (code.trim()) void take(code.trim());
  }

  return (
    <Card className="overflow-hidden">
      <div className="flex items-center gap-2 bg-chrome px-4 py-2.5 text-chrome-fg sm:px-5">
        <ScanLine aria-hidden className="size-4 text-brand" />
        <p className="text-xs font-semibold tracking-wide uppercase">{title}</p>
      </div>
      <CardBody>
        <form
          onSubmit={submit}
          className="flex flex-col gap-3 sm:flex-row sm:items-end"
        >
          <div className="min-w-0 flex-1">
            <Field
              label={label}
              controlSize="lg"
              autoCapitalize="characters"
              autoComplete="off"
              spellCheck={false}
              placeholder={placeholder}
              maxLength={14}
              value={code}
              onChange={(event) => setCode(event.target.value.toUpperCase())}
            />
          </div>
          <Button
            type="submit"
            size="lg"
            loading={busy}
            disabled={code.replace(/[\s-]/g, "").length < minLength || disabled}
            icon={actionIcon}
          >
            {actionLabel}
          </Button>
          <QrScanButton
            disabled={disabled}
            onCode={(scanned) => void take(scanned)}
          />
        </form>
      </CardBody>
    </Card>
  );
}
