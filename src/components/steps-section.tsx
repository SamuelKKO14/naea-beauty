"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { CalendarHeart, Heart, Sparkles } from "lucide-react";

const STEPS = [
  {
    n: "01",
    Icon: CalendarHeart,
    title: "Réservez votre créneau",
    text:
      "Choisissez votre soin, votre date et votre heure en quelques clics. Simple et rapide.",
  },
  {
    n: "02",
    Icon: Heart,
    title: "Profitez de votre soin",
    text:
      "Installez-vous confortablement. Amina prend soin de vous avec des produits professionnels sélectionnés.",
  },
  {
    n: "03",
    Icon: Sparkles,
    title: "Repartez sublimée",
    text:
      "Un résultat naturel et lumineux qui dure. Conseils d'entretien offerts.",
  },
];

export function StepsSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section
      id="etapes"
      ref={ref}
      className="relative z-10 bg-cream py-16 md:py-20"
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-xs uppercase tracking-[0.22em] text-bordeaux-600">
            En toute simplicité
          </span>
          <h2 className="mt-3 font-display text-2xl text-bordeaux-900 md:text-3xl">
            Comment ça se passe&nbsp;?
          </h2>
          <p className="mt-5 text-sm leading-relaxed text-bordeaux-900/70">
            De la réservation au résultat final, en trois étapes.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-8">
          {STEPS.map(({ n, Icon, title, text }, i) => (
            <motion.article
              key={n}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: i * 0.12, ease: "easeOut" }}
              className="relative flex flex-col items-center rounded-2xl border border-or-200/40 bg-white/70 p-7 text-center shadow-sm backdrop-blur-sm"
            >
              <span
                aria-hidden
                className="absolute right-4 top-3 font-display text-3xl text-or-300/40"
              >
                {n}
              </span>
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-bordeaux-900 text-white shadow-md shadow-bordeaux-900/20">
                <Icon size={24} />
              </span>
              <h3 className="mt-5 font-display text-xl text-bordeaux-900">
                {title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-bordeaux-900/70">
                {text}
              </p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
