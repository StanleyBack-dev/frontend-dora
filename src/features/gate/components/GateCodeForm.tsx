"use client";

import { useState, type FormEvent } from "react";
import { KeyRound, ScanLine } from "lucide-react";
import { Button, Card, CardBody, Field } from "@/design-system";
import { QrScanButton } from "@/features/bookings/components/QrScanButton";

// The gate's main action: the invite or ticket code typed (or read from the
// QR). The field clears once the entry is let in.
export function GateCodeForm({
  label,
  busy,
  disabled,
  onCode,
}: {
  label: string;
  busy: boolean;
  disabled: boolean;
  /** Lets the code in; true when it worked (the field then clears). */
  onCode: (code: string) => Promise<boolean>;
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
        <p className="text-xs font-semibold tracking-wide uppercase">
          Liberar pelo código ou QR
        </p>
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
              placeholder="Ex.: ABCD EFGH"
              maxLength={14}
              value={code}
              onChange={(event) => setCode(event.target.value.toUpperCase())}
            />
          </div>
          <Button
            type="submit"
            size="lg"
            loading={busy}
            disabled={code.replace(/[\s-]/g, "").length < 8 || disabled}
            icon={<KeyRound className="size-4" />}
          >
            Liberar entrada
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
