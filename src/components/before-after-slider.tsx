"use client";

import Image from "next/image";
import { useCallback, useRef, useState } from "react";

interface BeforeAfterSliderProps {
  before: string;
  after: string;
  alt?: string;
}

export function BeforeAfterSlider({
  before,
  after,
  alt = "Avant / Après",
}: BeforeAfterSliderProps) {
  const [position, setPosition] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const updatePosition = useCallback((clientX: number) => {
    const container = containerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const x = clientX - rect.left;
    const pct = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setPosition(pct);
  }, []);

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      dragging.current = true;
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
      updatePosition(e.clientX);
    },
    [updatePosition]
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragging.current) return;
      updatePosition(e.clientX);
    },
    [updatePosition]
  );

  const onPointerUp = useCallback(() => {
    dragging.current = false;
  }, []);

  return (
    <div
      ref={containerRef}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      className="relative aspect-[3/4] w-full select-none overflow-hidden rounded-lg touch-none"
    >
      {/* Image AVANT (full) */}
      <Image
        src={before}
        alt={`${alt} — avant`}
        fill
        className="object-cover"
        sizes="(max-width: 768px) 100vw, 50vw"
        draggable={false}
      />

      {/* Image APRÈS (clipped) */}
      <div
        className="absolute inset-0"
        style={{ clipPath: `inset(0 0 0 ${position}%)` }}
      >
        <Image
          src={after}
          alt={`${alt} — après`}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 50vw"
          draggable={false}
        />
      </div>

      {/* Label AVANT */}
      <span className="absolute left-3 top-3 rounded bg-white/80 px-2 py-1 text-xs uppercase tracking-wider text-bordeaux-900">
        Avant
      </span>

      {/* Label APRÈS */}
      <span className="absolute right-3 top-3 rounded bg-white/80 px-2 py-1 text-xs uppercase tracking-wider text-bordeaux-900">
        Après
      </span>

      {/* Barre verticale */}
      <div
        className="absolute top-0 bottom-0 z-10"
        style={{ left: `${position}%`, transform: "translateX(-50%)" }}
      >
        <div className="h-full w-[3px] bg-[#C9A84C]" />

        {/* Cercle central */}
        <div className="absolute left-1/2 top-1/2 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-[#C9A84C] bg-white shadow-md">
          <svg
            width="18"
            height="14"
            viewBox="0 0 18 14"
            fill="none"
            className="text-[#C9A84C]"
          >
            <path
              d="M5 1L1 7l4 6M13 1l4 6-4 6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}
