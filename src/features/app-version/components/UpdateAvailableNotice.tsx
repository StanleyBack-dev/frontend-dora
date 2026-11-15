"use client";

import { useEffect, useState } from "react";
import { RefreshCw, X } from "lucide-react";
import { Button } from "@/design-system";
import { APP_BUILD, type BuildInfo } from "@/shared/lib/app-version";

const VERSION_URL = "/api/public/version";
/** How often an open app asks whether a deploy happened. */
const CHECK_EVERY_MS = 10 * 60_000;

async function deployedBuild(): Promise<BuildInfo | null> {
  try {
    const response = await fetch(VERSION_URL, { cache: "no-store" });
    if (!response.ok) return null;
    const build = (await response.json()) as Partial<BuildInfo>;
    return typeof build.version === "string"
      ? { version: build.version, commit: build.commit ?? null }
      : null;
  } catch {
    return null;
  }
}

// After a deploy, an app left open (the installed app especially) still runs
// the old build. It checks the deployed one when it comes back to the
// screen and every 10 minutes; when it changed, a card offers to reload.
// The service worker caches nothing, so reloading is all an update takes.
// Off in development (no commit to compare).
export function UpdateAvailableNotice() {
  const [available, setAvailable] = useState<BuildInfo | null>(null);
  const [dismissed, setDismissed] = useState<string | null>(null);
  const [reloading, setReloading] = useState(false);

  useEffect(() => {
    if (!APP_BUILD.commit) return;
    let cancelled = false;

    async function check() {
      if (document.visibilityState !== "visible") return;
      const deployed = await deployedBuild();
      if (cancelled || !deployed?.commit) return;
      setAvailable(deployed.commit !== APP_BUILD.commit ? deployed : null);
    }

    const timer = window.setInterval(check, CHECK_EVERY_MS);
    document.addEventListener("visibilitychange", check);
    window.addEventListener("focus", check);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", check);
      window.removeEventListener("focus", check);
    };
  }, []);

  if (!available || dismissed === available.commit) return null;

  function reload() {
    setReloading(true);
    window.location.reload();
  }

  const newer = available.version !== APP_BUILD.version;

  return (
    <aside
      aria-label="Nova versão do Dora"
      role="status"
      className="fixed inset-x-3 bottom-[calc(4.75rem+env(safe-area-inset-bottom))] z-50 rounded-2xl border border-border bg-surface p-3 shadow-pop sm:inset-x-auto sm:right-6 sm:bottom-24 sm:w-80 sm:p-4 lg:bottom-6"
    >
      <div className="flex items-start gap-3">
        <span className="grid size-9 shrink-0 place-items-center rounded-md bg-accent-soft text-accent">
          <RefreshCw className="size-4" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-fg">
            Nova versão do Dora
            {newer ? ` (v${available.version})` : ""}
          </p>
          <p className="mt-0.5 text-sm text-muted">
            Atualize para usar as melhorias e correções mais recentes.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setDismissed(available.commit)}
          aria-label="Fechar"
          className="-mt-1 -mr-1 grid size-7 shrink-0 place-items-center rounded-md text-soft transition-colors hover:bg-surface-muted hover:text-fg"
        >
          <X className="size-4" aria-hidden />
        </button>
      </div>
      <div className="mt-3 flex gap-2">
        <Button
          size="sm"
          className="flex-1"
          onClick={reload}
          loading={reloading}
        >
          Atualizar agora
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setDismissed(available.commit)}
          disabled={reloading}
        >
          Depois
        </Button>
      </div>
    </aside>
  );
}
