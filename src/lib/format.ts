/**
 * Formate des centimes en euros « propres » : 7000 -> "70 €", 34700 -> "347 €",
 * 6990 -> "69,90 €". Sépare les milliers à la française.
 */
export function formatEuros(cents: number | null | undefined): string {
  if (cents == null) return "";
  const euros = cents / 100;
  const s = Number.isInteger(euros)
    ? euros.toLocaleString("fr-FR")
    : euros.toLocaleString("fr-FR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
  return `${s} €`;
}
