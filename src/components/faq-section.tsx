"use client";

import { AnimatePresence, motion, useInView } from "framer-motion";
import { Plus } from "lucide-react";
import { useRef, useState } from "react";

const QA = [
  {
    q: "Combien de temps dure un réhaussement de cils ?",
    a: "La prestation dure environ 1 heure. Le résultat est visible immédiatement et tient 6 à 8 semaines selon votre type de cils.",
  },
  {
    q: "Est-ce que le réhaussement abîme les cils ?",
    a: "Non, le réhaussement respecte le cil naturel. Je n'utilise que des produits professionnels doux et adaptés. Vos cils restent en pleine santé.",
  },
  {
    q: "Comment préparer mon rendez-vous ?",
    a: "Venez sans maquillage sur les yeux pour les prestations cils. Évitez le café et les boissons acides avant le blanchiment dentaire. C'est tout !",
  },
  {
    q: "Tu te déplaces à domicile ?",
    a: "Oui, je me déplace sur Nantes et ses alentours. Le tarif reste identique, pas de supplément déplacement.",
  },
  {
    q: "Faut-il verser un acompte ?",
    a: "Oui, un acompte de 50% est demandé pour confirmer votre rendez-vous. Il est non-remboursable en cas d'annulation. Paiement par PayPal ou virement.",
  },
  {
    q: "Je peux annuler mon rendez-vous ?",
    a: "Oui, à condition de prévenir au moins 24 heures à l'avance. Passé ce délai, l'acompte est conservé.",
  },
];

export function FaqSection() {
  const [open, setOpen] = useState<number | null>(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <section
      id="faq"
      ref={ref}
      className="relative z-10 py-16 md:py-20"
    >
      <div className="mx-auto max-w-3xl px-6 lg:px-10">
        <div className="text-center">
          <span className="text-xs uppercase tracking-[0.22em] text-bordeaux-600">
            Questions fréquentes
          </span>
          <h2 className="mt-3 font-display text-2xl text-bordeaux-900 md:text-3xl">
            Tout savoir avant votre RDV
          </h2>
        </div>

        <div className="mt-10 overflow-hidden rounded-2xl border border-bordeaux-100/70 bg-white/80 shadow-sm">
          {QA.map((item, i) => {
            const isOpen = open === i;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: i * 0.06 }}
                className={
                  i > 0 ? "border-t border-bordeaux-100/70" : ""
                }
              >
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : i)}
                  aria-expanded={isOpen}
                  aria-controls={`faq-panel-${i}`}
                  className="flex w-full items-center justify-between gap-4 px-5 py-5 text-left transition-colors hover:bg-or-50/40 md:px-6"
                >
                  <span className="font-medium text-bordeaux-900 md:text-lg">
                    {item.q}
                  </span>
                  <motion.span
                    animate={{ rotate: isOpen ? 45 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-or-100 text-bordeaux-900"
                    aria-hidden
                  >
                    <Plus size={16} />
                  </motion.span>
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      id={`faq-panel-${i}`}
                      key="panel"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: "easeOut" }}
                      className="overflow-hidden"
                    >
                      <p className="px-5 pb-5 text-sm leading-relaxed text-bordeaux-900/70 md:px-6 md:pb-6">
                        {item.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
