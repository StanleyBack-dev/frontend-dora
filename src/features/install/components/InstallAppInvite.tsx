"use client";

import { useState, useSyncExternalStore } from "react";
import { Smartphone, X } from "lucide-react";
import { Button } from "@/design-system";
import { IosInstallSteps } from "@/features/install/components/IosInstallSteps";
import {
  dismissInvite,
  promptInstall,
  useInstallState,
  wasInviteDismissed,
} from "@/features/install/model/install-store";

const noopSubscribe = () => () => {};

// One-time invitation to install the app: on phones a compact card pinned
// just above the tab bar (never over the middle of the page); on larger
// screens a small card floating in the corner. Once the user
// installs or closes it, it never comes back on this browser; the option
// stays available in Configurações.
export function InstallAppInvite() {
  const { ready, installed, canPrompt, ios } = useInstallState();
  // Read on the client only (the server render never shows the invite).
  const dismissedBefore = useSyncExternalStore(
    noopSubscribe,
    wasInviteDismissed,
    () => true,
  );
  const [closed, setClosed] = useState(false);
  const [busy, setBusy] = useState(false);

  if (!ready || installed || dismissedBefore || closed) {
    return null;
  }
  if (!canPrompt && !ios) return null;

  function close() {
    dismissInvite();
    setClosed(true);
  }

  async function install() {
    setBusy(true);
    await promptInstall();
    // Accepted or not, the question was asked: don't ask again.
    close();
  }

  return (
    <aside
      aria-label="Instalar o aplicativo"
      className="fixed inset-x-3 bottom-[calc(4.75rem+env(safe-area-inset-bottom))] z-40 rounded-2xl border border-border bg-surface p-3 shadow-pop sm:inset-x-auto sm:right-6 sm:bottom-24 sm:w-80 sm:p-4 lg:bottom-6"
    >
      <div className="flex items-start gap-3">
        <span className="grid size-9 shrink-0 place-items-center rounded-md bg-accent-soft text-accent">
          <Smartphone className="size-4" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-fg">Instale o Dora</p>
          <p className="mt-0.5 text-sm text-muted">
            {ios
              ? "Deixe o painel na tela inicial do seu iPhone:"
              : "Abra o painel direto da tela inicial, como um aplicativo."}
          </p>
        </div>
        <button
          type="button"
          onClick={close}
          aria-label="Fechar"
          className="-mt-1 -mr-1 grid size-7 shrink-0 place-items-center rounded-md text-soft transition-colors hover:bg-surface-muted hover:text-fg"
        >
          <X className="size-4" aria-hidden />
        </button>
      </div>

      {ios ? (
        <div className="mt-3">
          <IosInstallSteps />
          <Button
            variant="secondary"
            size="sm"
            className="mt-3 w-full"
            onClick={close}
          >
            Entendi
          </Button>
        </div>
      ) : (
        <div className="mt-3 flex gap-2">
          <Button size="sm" className="flex-1" onClick={install} loading={busy}>
            Instalar
          </Button>
          <Button variant="ghost" size="sm" onClick={close} disabled={busy}>
            Agora não
          </Button>
        </div>
      )}
    </aside>
  );
}
