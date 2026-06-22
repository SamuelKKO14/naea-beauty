"use client";

import { motion } from "framer-motion";
import { ArrowRight, Clock } from "lucide-react";

/**
 * <BoutonCommande /> — CTA d'achat.
 *
 * Redirection simple vers le checkout Gumroad de la formation : Gumroad gère le
 * paiement ET la livraison. Aucune intégration paiement côté site.
 * Si `checkoutUrl` est absent, le bouton s'affiche désactivé (« Bientôt
 * disponible »).
 *
 * Style repris à l'identique du `ShimmerButton` du site (bouton or + shimmer).
 */
export function BoutonCommande({
  checkoutUrl,
  prixLabel,
  label = "Je commande",
  className = "",
}: {
  checkoutUrl?: string | null;
  prixLabel?: string;
  label?: string;
  className?: string;
}) {
  if (!checkoutUrl) {
    return (
      <span
        aria-disabled="true"
        className={`relative inline-flex cursor-not-allowed items-center justify-center gap-2 rounded-full bg-or-500/40 px-8 py-4 text-xs font-semibold uppercase tracking-wider text-bordeaux-950/60 ${className}`}
      >
        <span className="flex items-center gap-2">
          <Clock size={16} /> Bientôt disponible
        </span>
      </span>
    );
  }

  return (
    <motion.a
      href={checkoutUrl}
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
    </motion.a>
  );
}
