"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";

type Photo = { src: string; alt: string };

export function GalleryCarousel({ photos }: { photos: Photo[] }) {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const touchStartX = useRef(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  /* Nombre de photos visibles selon la largeur */
  const [visibleCount, setVisibleCount] = useState(3);

  useEffect(() => {
    function update() {
      const w = window.innerWidth;
      if (w < 640) setVisibleCount(1);
      else if (w < 1024) setVisibleCount(2);
      else setVisibleCount(3);
    }
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const maxIndex = Math.max(0, photos.length - visibleCount);

  const go = useCallback(
    (dir: number) => {
      setDirection(dir);
      setIndex((prev) => Math.min(Math.max(prev + dir, 0), maxIndex));
    },
    [maxIndex]
  );

  /* Auto-scroll lent */
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setDirection(1);
      setIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
    }, 4000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [maxIndex]);

  const resetTimer = useCallback(
    (fn: () => void) => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      fn();
      intervalRef.current = setInterval(() => {
        setDirection(1);
        setIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
      }, 4000);
    },
    [maxIndex]
  );

  /* Swipe mobile */
  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
  }
  function handleTouchEnd(e: React.TouchEvent) {
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      resetTimer(() => go(diff > 0 ? 1 : -1));
    }
  }

  const slideWidth = 100 / visibleCount;

  return (
    <div className="relative">
      {/* Flèches desktop */}
      <button
        onClick={() => resetTimer(() => go(-1))}
        disabled={index === 0}
        className="absolute -left-4 top-1/2 z-20 hidden -translate-y-1/2 rounded-full bg-white/90 p-2.5 shadow-lg transition-all hover:bg-white disabled:opacity-30 md:block"
        aria-label="Photos précédentes"
      >
        <ChevronLeft size={20} className="text-bordeaux-900" />
      </button>
      <button
        onClick={() => resetTimer(() => go(1))}
        disabled={index >= maxIndex}
        className="absolute -right-4 top-1/2 z-20 hidden -translate-y-1/2 rounded-full bg-white/90 p-2.5 shadow-lg transition-all hover:bg-white disabled:opacity-30 md:block"
        aria-label="Photos suivantes"
      >
        <ChevronRight size={20} className="text-bordeaux-900" />
      </button>

      {/* Container carrousel */}
      <div
        className="overflow-hidden rounded-2xl"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <motion.div
          className="flex"
          animate={{ x: `-${index * slideWidth}%` }}
          transition={{ type: "spring", stiffness: 80, damping: 18 }}
        >
          {photos.map((p, i) => (
            <div
              key={i}
              className="shrink-0 px-1.5 md:px-2"
              style={{ width: `${slideWidth}%` }}
            >
              <div className="overflow-hidden rounded-xl border border-bordeaux-100/40 bg-white shadow-sm transition-shadow hover:shadow-xl hover:shadow-bordeaux-200/30">
                <Image
                  src={p.src}
                  alt={p.alt}
                  width={600}
                  height={600}
                  className="aspect-[4/5] h-auto w-full object-cover"
                />
              </div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Indicateur position */}
      <div className="mt-6 flex items-center justify-center gap-1.5">
        {Array.from({ length: Math.min(maxIndex + 1, 12) }, (_, i) => {
          const dotIndex = maxIndex <= 11 ? i : Math.round((i / 11) * maxIndex);
          return (
            <button
              key={i}
              onClick={() => resetTimer(() => {
                setDirection(dotIndex > index ? 1 : -1);
                setIndex(dotIndex);
              })}
              aria-label={`Photo ${dotIndex + 1}`}
              className={`h-2 rounded-full transition-all duration-300 ${
                Math.abs(dotIndex - index) < 1
                  ? "w-6 bg-or-500"
                  : "w-2 bg-bordeaux-200 hover:bg-bordeaux-300"
              }`}
            />
          );
        })}
      </div>
    </div>
  );
}
