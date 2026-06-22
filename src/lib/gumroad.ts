/**
 * Liens checkout Gumroad par slug de formation.
 *
 * On vend via Gumroad : Gumroad gère le paiement ET la livraison du produit
 * numérique. Les boutons du site redirigent simplement vers ces URLs
 * (`?wanted=true` ouvre directement le checkout). Aucune intégration paiement
 * côté site (pas de PayPal, pas de SDK).
 */
export const GUMROAD_CHECKOUT: Record<string, string> = {
  "blanchiment-dentaire-cosmetique":
    "https://naeaacademy.gumroad.com/l/fnxgf?wanted=true",
  "rehaussement-de-cils":
    "https://naeaacademy.gumroad.com/l/clvcrs?wanted=true",
};

/** URL checkout Gumroad pour un slug, ou null si la formation n'est pas en vente. */
export function checkoutUrlForSlug(slug: string): string | null {
  return GUMROAD_CHECKOUT[slug] ?? null;
}
