"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

/**
 * <BoutonCommande /> — CTA d'achat ISOLÉ (placeholder).
 *
 * Pour l'instant il ne déclenche AUCUN paiement (console.log uniquement).
 * À la brique 4, on branchera PayPal ici : remplacer le corps de `handleClick`
 * (création de commande + redirection / SDK PayPal). Tout le reste de la page
 * n'a pas à changer — ce composant est le seul point de branchement.
 *
 * Style repris à l'identique du `ShimmerButton` du site (bouton or + shimmer).
 */
export function BoutonCommande({
  formationSlug,
  prixLabel,
  label = "Je commande",
  className = "",
}: {
  formationSlug: string;
  prixLabel?: string;
  label?: string;
  className?: string;
}) {
  function handleClick() {
    // PLACEHOLDER — paiement non branché (brique 4 : PayPal).
    // eslint-disable-next-line no-console
    console.log("[BoutonCommande] commande (placeholder)", { formationSlug });
  }

  return (
    <motion.button
      type="button"
      onClick={handleClick}
      whileHover={{ scale: 1.06 }}
      whileTap={{ scale: 0.97 }}
      className={`group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-full bg-or-500 px-8 py-4 text-xs font-semibold uppercase tracking-wider text-bordeaux-950 shadow-lg shadow-or-500/20 transition-shadow hover:shadow-xl hover:shadow-or-500/40 ${className}`}
    >
      <span className="pointer-events-none absolute inset-0 animate-shimmer-gold bg-gradient-to-r from-transparent via-white/40 to-transparent" />
      <span className="relative z-10 flex items-center gap-2">
        {label}
        {prixLabel ? <span className="opacity-90">· {prixLabel}</span> : null}
        <ArrowRight
          size={16}
          className="transition-transform group-hover:translate-x-1"
        />
      </span>
    </motion.button>
  );
}
