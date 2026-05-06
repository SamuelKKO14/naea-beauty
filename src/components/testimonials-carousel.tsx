"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star } from "lucide-react";

/* ── Données fictives crédibles ────────────────────────── */
const TESTIMONIALS = [
  {
    id: 1,
    name: "Camille D.",
    service: "Réhaussement de cils",
    stars: 5,
    text: "Un regard complètement transformé ! Je n'ai plus besoin de mascara, mes cils sont sublimes au naturel. L'application est douce et le résultat dure vraiment longtemps. Je recommande les yeux fermés.",
  },
  {
    id: 2,
    name: "Inès M.",
    service: "Browlift + restructuration",
    stars: 5,
    text: "Mes sourcils n'ont jamais été aussi bien dessinés. Le browlift donne un effet laminé magnifique et la restructuration est impeccable. Naéa est très minutieuse et à l'écoute.",
  },
  {
    id: 3,
    name: "Léa R.",
    service: "Blanchiment dentaire",
    stars: 5,
    text: "Résultat bluffant dès la première séance ! Mon sourire est beaucoup plus lumineux et le soin est totalement indolore. L'ambiance est cosy, on se sent vraiment chouchoutée.",
  },
  {
    id: 4,
    name: "Manon B.",
    service: "Réhaussement de cils + teinture",
    stars: 5,
    text: "La combinaison réhaussement + teinture est parfaite. Mes cils ont l'air deux fois plus longs et la teinture apporte une intensité incroyable. Je ne peux plus m'en passer !",
  },
  {
    id: 5,
    name: "Sarah K.",
    service: "Browlift",
    stars: 5,
    text: "Je suis venue pour un browlift avant mon mariage et le résultat était exactement ce que je voulais. Des sourcils structurés et naturels à la fois. Merci Naéa pour ta douceur !",
  },
];

/* ── Composant principal ──────────────────────────────── */
export function TestimonialsCarousel() {
  const [active, setActive] = useState(0);
  const [direction, setDirection] = useState(1);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const touchStartX = useRef(0);

  const goTo = useCallback(
    (index: number) => {
      setDirection(index > active ? 1 : -1);
      setActive(index);
    },
    [active]
  );

  const next = useCallback(() => {
    setDirection(1);
    setActive((p) => (p + 1) % TESTIMONIALS.length);
  }, []);

  const prev = useCallback(() => {
    setDirection(-1);
    setActive((p) => (p - 1 + TESTIMONIALS.length) % TESTIMONIALS.length);
  }, []);

  /* Auto-play */
  useEffect(() => {
    intervalRef.current = setInterval(next, 5000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [next]);

  /* Reset timer on manual interaction */
  const interact = useCallback(
    (fn: () => void) => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      fn();
      intervalRef.current = setInterval(next, 5000);
    },
    [next]
  );

  /* Swipe support */
  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
  }
  function handleTouchEnd(e: React.TouchEvent) {
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      interact(diff > 0 ? next : prev);
    }
  }

  const t = TESTIMONIALS[active];

  const variants = {
    enter: (d: number) => ({ x: d > 0 ? 120 : -120, opacity: 0, scale: 0.92 }),
    center: { x: 0, opacity: 1, scale: 1 },
    exit: (d: number) => ({ x: d > 0 ? -120 : 120, opacity: 0, scale: 0.92 }),
  };

  return (
    <div
      className="relative mx-auto max-w-3xl select-none px-4"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Decorative quote */}
      <span className="pointer-events-none absolute -top-4 left-6 font-display text-8xl leading-none text-or-300/20 md:left-0 md:text-9xl">
        &ldquo;
      </span>

      {/* Card */}
      <div className="relative min-h-[280px] overflow-hidden">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={t.id}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.45, ease: "easeInOut" }}
            className="absolute inset-0 flex flex-col items-center justify-center text-center"
          >
            {/* Stars */}
            <div className="mb-4 flex gap-1">
              {Array.from({ length: t.stars }).map((_, i) => (
                <Star
                  key={i}
                  size={20}
                  className="fill-or-400 text-or-400"
                />
              ))}
            </div>

            {/* Quote text */}
            <p className="text-sm leading-relaxed text-bordeaux-900/70 md:text-base">
              &ldquo;{t.text}&rdquo;
            </p>

            {/* Author */}
            <div className="mt-6">
              <p className="font-display text-base text-bordeaux-900">
                {t.name}
              </p>
              <p className="text-sm text-bordeaux-600">{t.service}</p>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Dots */}
      <div className="mt-8 flex items-center justify-center gap-2">
        {TESTIMONIALS.map((_, i) => (
          <button
            key={i}
            onClick={() => interact(() => goTo(i))}
            aria-label={`Témoignage ${i + 1}`}
            className={`h-2.5 rounded-full transition-all duration-300 ${
              i === active
                ? "w-8 bg-or-500"
                : "w-2.5 bg-bordeaux-200 hover:bg-bordeaux-300"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
