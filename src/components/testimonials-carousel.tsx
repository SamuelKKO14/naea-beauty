"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star } from "lucide-react";

/* ── Témoignages ─────────────────────────────────────── */
export type Testimonial = {
  id: number;
  name: string;
  service: string;
  stars: number;
  text: string;
};

const TESTIMONIALS: Testimonial[] = [
  {
    id: 1,
    name: "Inès L.",
    service: "Réhaussement de cils",
    stars: 5,
    text: "Mes cils ont une courbure incroyable, on dirait que je porte du mascara alors que non. Le résultat est hyper naturel, exactement ce que je voulais. Je reviens dans 6 semaines c'est sûr.",
  },
  {
    id: 2,
    name: "Sofia M., 24 ans",
    service: "Réhaussement de cils + teinture",
    stars: 5,
    text: "J'avais un peu peur parce que c'était ma première fois mais Amina m'a mise à l'aise direct. Le rendu est magnifique, mes cils sont tellement beaux que j'ai rangé mon mascara.",
  },
  {
    id: 3,
    name: "Léa R.",
    service: "Browlift",
    stars: 5,
    text: "Mes sourcils n'ont jamais été aussi bien dessinés. L'effet laminé est top, ça structure tout le visage. Et en plus c'est super rapide.",
  },
  {
    id: 4,
    name: "Mariam K., 28 ans",
    service: "Réhaussement de cils",
    stars: 5,
    text: "Troisième fois que je viens et c'est toujours aussi parfait. Un vrai moment de détente à chaque fois, et le résultat tient vraiment les 8 semaines.",
  },
  {
    id: 5,
    name: "Chloé B.",
    service: "Blanchiment dentaire Ultra White",
    stars: 5,
    text: "Je n'y croyais pas trop mais le résultat est bluffant. Mes dents sont visiblement plus blanches dès la première séance. Amina est vraiment pro et rassurante.",
  },
  {
    id: 6,
    name: "Yasmine D., 22 ans",
    service: "Browlift + restructuration",
    stars: 5,
    text: "J'avais des sourcils un peu dans tous les sens et maintenant ils sont parfaitement dessinés. L'effet est canon et ça dure longtemps.",
  },
  {
    id: 7,
    name: "Emma T.",
    service: "Réhaussement de cils + teinture",
    stars: 5,
    text: "Le combo réhaussement + teinture c'est vraiment le game changer. On se réveille le matin avec un regard de ouf. Merci pour ce moment de douceur.",
  },
  {
    id: 8,
    name: "Aïcha N., 26 ans",
    service: "Retouche blanchiment",
    stars: 5,
    text: "Je suis venue pour la retouche après ma première séance et l'éclat est revenu direct. L'ambiance est hyper cosy, on se sent bien. Je recommande Amina les yeux fermés.",
  },
  {
    id: 9,
    name: "Nour H., 19 ans",
    service: "Réhaussement de cils",
    stars: 5,
    text: "C'était mon premier réhaussement et franchement j'aurais dû le faire avant. Mes cils sont naturellement sublimes maintenant, toutes mes copines me demandent où j'ai fait. Merci Amina !",
  },
  {
    id: 10,
    name: "Maëva P., 18 ans",
    service: "Réhaussement de cils + teinture",
    stars: 5,
    text: "J'hésitais entre extensions et réhaussement, Amina m'a conseillé le réhaussement + teinture et c'est exactement ce qu'il me fallait. Résultat hyper naturel et zéro entretien.",
  },
  {
    id: 11,
    name: "Jade S., 20 ans",
    service: "Browlift",
    stars: 5,
    text: "Mes sourcils étaient ma plus grosse insécurité et maintenant c'est ce que je préfère sur mon visage. L'effet laminé est parfait, ça change tout.",
  },
  {
    id: 12,
    name: "Lina A., 19 ans",
    service: "Blanchiment dentaire Ultra White",
    stars: 5,
    text: "Je souriais jamais sur les photos avant. Depuis le blanchiment chez Naéa je souris tout le temps, le résultat est fou pour une seule séance.",
  },
  {
    id: 13,
    name: "Ambre C., 20 ans",
    service: "Réhaussement de cils + teinture",
    stars: 5,
    text: "Troisième rendez-vous et toujours aussi satisfaite. L'ambiance est douce, Amina prend son temps et le résultat est toujours au top. Mon rdv beauté préféré.",
  },
];

/**
 * Avis réels filtrés par thème de formation (aucun avis inventé).
 * - slug "…cils…"        → avis mentionnant les cils
 * - slug "…blanchiment…" → avis mentionnant le blanchiment
 * Renvoie [] si aucun avis réel ne correspond (la page masque alors la section).
 * Sans slug reconnu → tous les avis (usage page d'accueil).
 */
export function getTestimonialsForFormation(slug: string): Testimonial[] {
  const s = slug.toLowerCase();
  let re: RegExp | null = null;
  if (s.includes("cils")) re = /cils/i;
  else if (s.includes("blanchiment")) re = /blanchiment/i;
  if (!re) return TESTIMONIALS;
  return TESTIMONIALS.filter((t) => re.test(t.service));
}

/* ── Composant principal ──────────────────────────────── */
export function TestimonialsCarousel({ items }: { items?: Testimonial[] } = {}) {
  const data = items && items.length > 0 ? items : TESTIMONIALS;
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
    setActive((p) => (p + 1) % data.length);
  }, [data.length]);

  const prev = useCallback(() => {
    setDirection(-1);
    setActive((p) => (p - 1 + data.length) % data.length);
  }, [data.length]);

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

  const t = data[active] ?? data[0];

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
        {data.map((_, i) => (
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
