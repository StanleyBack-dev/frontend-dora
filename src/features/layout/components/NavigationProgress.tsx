"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { NAVIGATION_START_EVENT } from "@/shared/lib/navigation-progress";

/** Fast navigations finish before this and never show the bar. */
const SHOW_AFTER_MS = 150;
/** Gives up if the page never changes (e.g. a link to the same URL). */
const GIVE_UP_MS = 20_000;

type Phase = "idle" | "waiting" | "running" | "done";

// A thin bar at the top of the screen while the app moves to another page:
// any internal link, any filter/search form (GET) and navigations started in
// code (startNavigation). It finishes when the address changes, so every
// click gets feedback even where the page has no loading state of its own.
export function NavigationProgress() {
  return (
    <Suspense fallback={null}>
      <Bar />
    </Suspense>
  );
}

function Bar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [phase, setPhase] = useState<Phase>("idle");
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearTimers = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };

  // Start: links, GET forms and announced navigations.
  useEffect(() => {
    const start = () => {
      clearTimers();
      setPhase("waiting");
      timers.current.push(
        setTimeout(
          () => setPhase((now) => (now === "waiting" ? "running" : now)),
          SHOW_AFTER_MS,
        ),
        setTimeout(() => setPhase("idle"), GIVE_UP_MS),
      );
    };

    const onClick = (event: MouseEvent) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }
      const anchor = (event.target as Element | null)?.closest?.("a[href]");
      if (!(anchor instanceof HTMLAnchorElement)) return;
      if (anchor.target && anchor.target !== "_self") return;
      if (anchor.hasAttribute("download")) return;
      if (isSameOriginOtherPage(anchor.href)) start();
    };

    const onSubmit = (event: SubmitEvent) => {
      const form = event.target;
      if (!(form instanceof HTMLFormElement) || event.defaultPrevented) return;
      if ((form.method || "get").toLowerCase() !== "get") return;
      if (isSameOrigin(form.action || window.location.href)) start();
    };

    // Clicks bubble after React's handlers, so a link that cancels its own
    // navigation (preventDefault) is already marked.
    document.addEventListener("click", onClick);
    document.addEventListener("submit", onSubmit);
    window.addEventListener(NAVIGATION_START_EVENT, start);
    return () => {
      document.removeEventListener("click", onClick);
      document.removeEventListener("submit", onSubmit);
      window.removeEventListener(NAVIGATION_START_EVENT, start);
      clearTimers();
    };
  }, []);

  // Finish: the new page is on screen.
  useEffect(() => {
    clearTimers();
    setPhase((now) => {
      if (now === "running") {
        timers.current.push(setTimeout(() => setPhase("idle"), 300));
        return "done";
      }
      return "idle";
    });
  }, [pathname, searchParams]);

  if (phase === "idle" || phase === "waiting") return null;
  return (
    <div
      role="progressbar"
      aria-label="Carregando a página"
      aria-busy={phase === "running"}
      className="pointer-events-none fixed inset-x-0 top-0 z-[100] h-[3px]"
    >
      <div
        className={
          phase === "running"
            ? "h-full animate-nav-progress bg-brand shadow-[0_0_8px_var(--brand)]"
            : "h-full w-full bg-brand opacity-0 transition-opacity duration-300"
        }
      />
    </div>
  );
}

function isSameOrigin(href: string): boolean {
  try {
    return (
      new URL(href, window.location.href).origin === window.location.origin
    );
  } catch {
    return false;
  }
}

/** Same site, another page or query (a jump inside the page is not one). */
function isSameOriginOtherPage(href: string): boolean {
  try {
    const target = new URL(href, window.location.href);
    const here = new URL(window.location.href);
    return (
      target.origin === here.origin &&
      (target.pathname !== here.pathname || target.search !== here.search)
    );
  } catch {
    return false;
  }
}
