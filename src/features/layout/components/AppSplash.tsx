"use client";

import { useEffect, useState } from "react";
import { Spinner, cn } from "@/design-system";
import { Wordmark } from "@/features/layout/components/Logo";
import { LogoMark } from "@/features/layout/components/LogoMark";

/** Shortest time on screen since the app opened, so it doesn't just flash. */
const MIN_VISIBLE_MS = 700;
const FADE_MS = 300;

// Opening screen of the app: it comes in the first HTML of
// the page, before the session and the data load, and fades out as soon as the
// app is interactive (hydrated) — not on window "load", which also waits for
// every image and font. Lives in the root layout, so moving between pages
// never shows it again; only opening or reloading the app does. If scripts
// never run, a CSS animation (globals.css) still takes it away.
export function AppSplash() {
  const [stage, setStage] = useState<"shown" | "leaving" | "gone">("shown");

  useEffect(() => {
    let timer = window.setTimeout(
      () => {
        setStage("leaving");
        timer = window.setTimeout(() => setStage("gone"), FADE_MS);
      },
      Math.max(0, MIN_VISIBLE_MS - performance.now()),
    );
    return () => window.clearTimeout(timer);
  }, []);

  if (stage === "gone") return null;
  return (
    <div
      role="status"
      aria-label="Carregando o Dora"
      className={cn(
        "app-splash fixed inset-0 z-[100] flex flex-col items-center justify-center bg-linear-to-br from-chrome-top via-chrome to-chrome-bottom px-6 text-chrome-fg transition-opacity duration-300",
        stage === "leaving" && "pointer-events-none opacity-0",
      )}
    >
      <div className="flex flex-col items-center gap-12">
        <div className="flex flex-col items-center gap-5">
          <LogoMark className="size-20 drop-shadow-[0_12px_32px_rgb(255_107_26/0.35)]" />
          <div className="text-center">
            <Wordmark tone="light" className="text-5xl" />
            <p className="mt-3 text-[13px] text-chrome-muted">
              Reservas do seu condomínio
            </p>
          </div>
        </div>
        <Spinner className="text-brand" label="Carregando" />
      </div>
    </div>
  );
}
