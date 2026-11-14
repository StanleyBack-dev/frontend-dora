"use client";

import { useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/design-system";
import type { SpacePhoto } from "@/shared/contracts/spaces";

/** Horizontal drag (px) that counts as a swipe. */
const SWIPE = 40;

// Flips through a space's photos without leaving the page: arrows, dots,
// swipe on phones and ←/→ on the keyboard. One photo shows as a plain image.
export function SpacePhotoCarousel({
  photos,
  name,
  variant = "card",
  className,
}: {
  photos: SpacePhoto[];
  /** The space's name, for the images' alt text. */
  name: string;
  /** "card": compact controls; "page": larger, with the photo counter. */
  variant?: "card" | "page";
  className?: string;
}) {
  const [index, setIndex] = useState(0);
  const start = useRef<number | null>(null);
  const count = photos.length;
  if (count === 0) return null;

  const current = Math.min(index, count - 1);
  const go = (delta: number) =>
    setIndex((value) => (value + delta + count) % count);
  // Inside a clickable card: flipping must not open the space.
  const stop = (event: { preventDefault(): void; stopPropagation(): void }) => {
    event.preventDefault();
    event.stopPropagation();
  };

  function onKeyDown(event: KeyboardEvent) {
    if (event.key === "ArrowLeft") go(-1);
    if (event.key === "ArrowRight") go(1);
  }
  function onPointerDown(event: PointerEvent) {
    start.current = event.clientX;
  }
  function onPointerUp(event: PointerEvent) {
    if (start.current === null) return;
    const delta = event.clientX - start.current;
    start.current = null;
    if (Math.abs(delta) >= SWIPE) go(delta < 0 ? 1 : -1);
  }

  const page = variant === "page";
  const arrow = cn(
    "absolute top-1/2 z-10 grid -translate-y-1/2 place-items-center rounded-full bg-fg/60 text-surface backdrop-blur-sm transition-all hover:bg-fg/80",
    page
      ? "size-10"
      : "size-8 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 sm:focus-visible:opacity-100",
  );

  return (
    <div
      role="region"
      aria-roledescription="carrossel"
      aria-label={`Fotos de ${name}`}
      tabIndex={count > 1 ? 0 : undefined}
      onKeyDown={count > 1 ? onKeyDown : undefined}
      onPointerDown={count > 1 ? onPointerDown : undefined}
      onPointerUp={count > 1 ? onPointerUp : undefined}
      className={cn(
        "relative touch-pan-y overflow-hidden bg-surface-muted select-none",
        className,
      )}
    >
      <div
        className="flex h-full transition-transform duration-300 ease-out"
        style={{ transform: `translateX(-${current * 100}%)` }}
      >
        {photos.map((photo, position) => (
          // eslint-disable-next-line @next/next/no-img-element -- short-lived signed storage URLs
          <img
            key={photo.id}
            src={photo.url}
            alt={`${name}: foto ${position + 1} de ${count}`}
            aria-hidden={position !== current}
            loading={position === 0 ? undefined : "lazy"}
            draggable={false}
            className="size-full shrink-0 object-cover"
          />
        ))}
      </div>

      {count > 1 && (
        <>
          <button
            type="button"
            aria-label="Foto anterior"
            onClick={(event) => {
              stop(event);
              go(-1);
            }}
            className={cn(arrow, "left-2")}
          >
            <ChevronLeft aria-hidden className="size-5" />
          </button>
          <button
            type="button"
            aria-label="Próxima foto"
            onClick={(event) => {
              stop(event);
              go(1);
            }}
            className={cn(arrow, "right-2")}
          >
            <ChevronRight aria-hidden className="size-5" />
          </button>
          <div className="absolute inset-x-0 bottom-2 z-10 flex items-center justify-center gap-1.5">
            {photos.map((photo, position) => (
              <button
                key={photo.id}
                type="button"
                aria-label={`Ver foto ${position + 1}`}
                aria-current={position === current}
                onClick={(event) => {
                  stop(event);
                  setIndex(position);
                }}
                className={cn(
                  "h-1.5 rounded-full bg-surface/70 transition-all",
                  position === current ? "w-5 bg-surface" : "w-1.5",
                )}
              />
            ))}
          </div>
          {page && (
            <span className="absolute top-3 right-3 z-10 rounded-full bg-fg/60 px-2.5 py-1 text-xs font-semibold text-surface backdrop-blur-sm">
              {current + 1} / {count}
            </span>
          )}
        </>
      )}
    </div>
  );
}
