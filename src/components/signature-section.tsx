"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { ArrowRight, Sparkles } from "lucide-react";

export function SignatureSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section
      id="signature"
      ref={ref}
      className="relative overflow-hidden bg-bordeaux-950 text-or-100"
    >
      {/* Gradient subtil */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(201,169,97,0.18),transparent_55%),radial-gradient(circle_at_bottom_left,rgba(110,31,60,0.6),transparent_60%)]"
      />

      <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-6 py-16 md:py-20 lg:grid-cols-[1.2fr_1fr] lg:gap-16 lg:px-10">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-or-300/30 bg-or-300/10 px-3 py-1 text-[11px] uppercase tracking-[0.22em] text-or-300">
            <Sparkles size={12} /> Notre spécialité
          </span>
          <h2 className="mt-4 font-display text-3xl leading-tight text-white md:text-4xl lg:text-5xl">
            Réhaussement <span className="italic text-or-300">de cils</span>
          </h2>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-or-100/75">
            Notre signature — un regard sublimé, une courbure naturelle qui dure
            <span className="font-semibold text-or-200"> 6 à 8 semaines</span>.
            Sans extension, sans mascara, juste vos cils, en mieux.
          </p>

          <ul className="mt-6 space-y-2 text-sm text-or-100/75">
            {[
              "Résultat visible immédiatement",
              "Produits professionnels haut de gamme",
              "Soin sur-mesure adapté à vos cils",
            ].map((item) => (
              <li key={item} className="flex items-start gap-2">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-or-400" />
                {item}
              </li>
            ))}
          </ul>

          <Link
            href="#reserver"
            className="mt-7 inline-flex items-center gap-2 rounded-full bg-or-500 px-6 py-3 text-sm font-semibold text-bordeaux-950 shadow-lg shadow-or-500/30 transition-all hover:bg-or-400 hover:shadow-or-400/50"
          >
            Réserver cette prestation
            <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.15, ease: "easeOut" }}
          className="relative mx-auto w-full max-w-md"
        >
          <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] shadow-2xl shadow-black/50 ring-1 ring-or-300/20">
            <Image
              src="/before-after/apres-1.jpg"
              alt="Réhaussement de cils — résultat"
              fill
              sizes="(min-width: 1024px) 480px, 90vw"
              className="object-cover"
            />
            <div
              aria-hidden
              className="absolute inset-0 bg-gradient-to-t from-bordeaux-950/40 via-transparent"
            />
            <span className="absolute bottom-4 left-4 rounded-full bg-bordeaux-950/70 px-3 py-1 text-xs text-or-100 backdrop-blur-sm">
              Résultat après 1h
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
