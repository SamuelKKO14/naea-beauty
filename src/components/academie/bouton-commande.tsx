"use client";

import { motion } from "framer-motion";
import { ArrowRight, Clock } from "lucide-react";

/**
 * <BoutonCommande /> — CTA d'achat.
 *
 * Ouvre le checkout Gumroad de la formation EN OVERLAY, en mode produit unique
 * (`data-gumroad-single-product="true"`) : seul ce produit est présenté, jamais
 * un panier groupé avec d'autres formations. Le script `gumroad.js` est chargé
 * une seule fois par la page de vente (voir FormationSalesPage).
 *
 * Si `checkoutUrl` est absent, le bouton s'affiche désactivé (« Bientôt
 * disponible »). Aucune intégration paiement côté site (pas de PayPal).
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
      // Overlay Gumroad, produit unique : empêche tout panier groupé.
      className={`gumroad-button group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-full bg-or-500 px-8 py-4 text-xs font-semibold uppercase tracking-wider text-bordeaux-950 shadow-lg shadow-or-500/20 transition-shadow hover:shadow-xl hover:shadow-or-500/40 ${className}`}
      data-gumroad-single-product="true"
      whileHover={{ scale: 1.06 }}
      whileTap={{ scale: 0.97 }}
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
