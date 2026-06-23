/**
 * Liens checkout Gumroad par slug de formation.
 *
 * On vend via Gumroad : Gumroad gère le paiement ET la livraison du produit
 * numérique. Les boutons du site redirigent simplement vers ces URLs
 * (`?wanted=true` ouvre directement le checkout). Aucune intégration paiement
 * côté site (pas de PayPal, pas de SDK).
 */
// Le code promo de lancement est auto-appliqué via le format « code dans le
// chemin » de Gumroad (/l/<permalink>/<CODE>) : la cliente arrive directement au
// prix de lancement (69 €) sans avoir à saisir le code.
export const GUMROAD_CHECKOUT: Record<string, string> = {
  "blanchiment-dentaire-cosmetique":
    "https://naeaacademy.gumroad.com/l/fnxgf/LANCEMENT69?wanted=true",
  "rehaussement-de-cils":
    "https://naeaacademy.gumroad.com/l/clvcrs/LANCEMENT69?wanted=true",
};

/** URL checkout Gumroad pour un slug, ou null si la formation n'est pas en vente. */
export function checkoutUrlForSlug(slug: string): string | null {
  return GUMROAD_CHECKOUT[slug] ?? null;
}
