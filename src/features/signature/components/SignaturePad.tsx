"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Eraser, PenLine } from "lucide-react";
import { Button, cn } from "@/design-system";
import type {
  SignatureDrawing,
  SignaturePoint,
} from "@/shared/contracts/signature";

/** What the pad hands over once something is drawn. */
export type SignatureCapture = {
  drawing: SignatureDrawing;
  /** Base64 PNG (no data: prefix), transparent background. */
  image: string;
  /** How it was drawn: "touch", "pen" or "mouse". */
  pointerType: string;
};

const HEIGHT = 200;
/** The API refuses longer drawings; the pad stops taking points there. */
const MAX_POINTS = 10_000;
const MAX_DURATION_MS = 600_000;

const round1 = (value: number) => Math.round(value * 10) / 10;

// A signature drawn with a finger, a stylus or the mouse. Each point keeps
// its position (CSS pixels of the pad), the time since the first one and
// the pressure, the evidence the API stores with the image. Resizing the
// pad (turning the tablet) clears it: the points would no longer match.
export function SignaturePad({
  onChange,
  disabled = false,
}: {
  /** null: cleared. */
  onChange: (capture: SignatureCapture | null) => void;
  disabled?: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const strokes = useRef<SignaturePoint[][]>([]);
  const startedAt = useRef<number | null>(null);
  const pointerType = useRef("mouse");
  const drawing = useRef(false);
  const size = useRef({ width: 0, height: HEIGHT });
  const [empty, setEmpty] = useState(true);

  const context = () => canvasRef.current?.getContext("2d") ?? null;

  const clear = useCallback(() => {
    strokes.current = [];
    startedAt.current = null;
    drawing.current = false;
    const canvas = canvasRef.current;
    const ctx = context();
    if (canvas && ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
    setEmpty(true);
    onChange(null);
  }, [onChange]);

  // The canvas follows its box at the screen's density (sharp lines).
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const fit = () => {
      const width = Math.round(canvas.getBoundingClientRect().width);
      if (width === size.current.width) return;
      const ratio = window.devicePixelRatio || 1;
      size.current = { width, height: HEIGHT };
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(HEIGHT * ratio);
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.strokeStyle = "#111827";
      }
      if (strokes.current.length > 0) clear();
    };
    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(canvas);
    return () => observer.disconnect();
  }, [clear]);

  function pointOf(event: PointerEvent | React.PointerEvent): SignaturePoint {
    const rect = canvasRef.current!.getBoundingClientRect();
    const { width, height } = size.current;
    const now = event.timeStamp;
    if (startedAt.current === null) startedAt.current = now;
    // Mice report 0.5 while pressed; pens and some screens the real force.
    const pressure = event.pressure > 0 ? event.pressure : 0.5;
    return [
      round1(Math.min(Math.max(event.clientX - rect.left, 0), width)),
      round1(Math.min(Math.max(event.clientY - rect.top, 0), height)),
      Math.min(Math.round(now - startedAt.current), MAX_DURATION_MS),
      Math.round(Math.min(Math.max(pressure, 0), 1) * 100) / 100,
    ];
  }

  const total = () =>
    strokes.current.reduce((sum, stroke) => sum + stroke.length, 0);

  function addPoint(point: SignaturePoint) {
    const stroke = strokes.current.at(-1);
    const ctx = context();
    if (!stroke || !ctx || total() >= MAX_POINTS) return;
    const last = stroke.at(-1);
    // Time never goes back (the API checks it).
    if (last && point[2] < last[2]) point[2] = last[2];
    stroke.push(point);
    ctx.lineWidth = 1.2 + point[3] * 2.4;
    ctx.beginPath();
    ctx.moveTo(last ? last[0] : point[0], last ? last[1] : point[1]);
    ctx.lineTo(point[0], point[1]);
    ctx.stroke();
  }

  function down(event: React.PointerEvent<HTMLCanvasElement>) {
    if (disabled || strokes.current.length >= 100) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    pointerType.current = event.pointerType || "mouse";
    drawing.current = true;
    strokes.current.push([]);
    addPoint(pointOf(event));
  }

  function move(event: React.PointerEvent<HTMLCanvasElement>) {
    if (!drawing.current) return;
    event.preventDefault();
    const events = event.nativeEvent.getCoalescedEvents?.() ?? [
      event.nativeEvent,
    ];
    for (const item of events) addPoint(pointOf(item));
  }

  function up() {
    if (!drawing.current) return;
    drawing.current = false;
    const canvas = canvasRef.current;
    if (!canvas) return;
    setEmpty(false);
    onChange({
      drawing: { ...size.current, strokes: strokes.current.map((s) => [...s]) },
      image: canvas
        .toDataURL("image/png")
        .replace(/^data:image\/png;base64,/, ""),
      pointerType: pointerType.current,
    });
  }

  return (
    <div className="space-y-2">
      <div
        className={cn(
          "relative overflow-hidden rounded-xl border-2 border-dashed bg-white",
          disabled ? "border-border opacity-60" : "border-brand/50",
        )}
      >
        <canvas
          ref={canvasRef}
          aria-label="Quadro de assinatura: assine com o dedo, a caneta ou o mouse"
          role="img"
          className="block w-full touch-none select-none"
          style={{ height: HEIGHT }}
          onPointerDown={down}
          onPointerMove={move}
          onPointerUp={up}
          onPointerCancel={up}
          onPointerLeave={up}
        />
        {empty && (
          <p className="pointer-events-none absolute inset-0 flex items-center justify-center gap-2 text-sm text-soft">
            <PenLine aria-hidden className="size-4" />
            Assine aqui com o dedo ou a caneta
          </p>
        )}
        <span
          aria-hidden
          className="pointer-events-none absolute right-6 bottom-10 left-6 border-b border-border"
        />
      </div>
      <div className="flex justify-end">
        <Button
          size="sm"
          variant="secondary"
          icon={<Eraser className="size-4" />}
          onClick={clear}
          disabled={disabled || empty}
        >
          Limpar assinatura
        </Button>
      </div>
    </div>
  );
}
