// Logique pure de disponibilités — partagée client / serveur.
// Single source of truth pour : parse temps, génération créneaux, validation.
//
// Multi-plages : un même jour peut avoir plusieurs lignes
// `disponibilites_specifiques` (ex: 08:30-11:00 + 20:30-00:00).
// Les fonctions ci-dessous acceptent un ARRAY de dispos pour un jour.

import type { DisponibiliteSpecifique, Indisponibilite } from "@/lib/types";

export type BookedSlotLike = {
  date_rdv: string;
  heure_rdv: string;
  prestation?: { duree_minutes: number }[] | null;
};

// "HH:MM" ou "HH:MM:SS" → minutes depuis minuit.
// "00:00" / "00:00:00" en tant qu'heure de fin signifie "minuit fin de journée" → 24*60.
export function parseTimeStart(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + (m || 0);
}

export function parseTimeEnd(t: string): number {
  const [h, m] = t.split(":").map(Number);
  const mins = h * 60 + (m || 0);
  return mins === 0 ? 24 * 60 : mins;
}

export function formatSlot(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
}

export function dateToStr(d: Date): string {
  return `${d.getFullYear()}-${(d.getMonth() + 1)
    .toString()
    .padStart(2, "0")}-${d.getDate().toString().padStart(2, "0")}`;
}

export function isDateInIndispo(
  dateStr: string,
  indispos: Pick<Indisponibilite, "date_debut" | "date_fin">[]
): boolean {
  return indispos.some((i) => dateStr >= i.date_debut && dateStr <= i.date_fin);
}

// Génère les créneaux disponibles pour un jour donné, à travers TOUTES les plages.
// Retourne [] si :
//  - aucune dispo active pour ce jour
//  - le jour est en indisponibilité
// Le battement (battementMinutes) ne s'applique qu'À L'INTÉRIEUR d'une plage,
// pas entre plages distinctes.
export function generateSlots(opts: {
  dateStr: string;
  dispos: DisponibiliteSpecifique[]; // 0 à N plages pour ce jour
  dureeMinutes: number;
  battementMinutes: number;
  indispos: Pick<Indisponibilite, "date_debut" | "date_fin">[];
  bookedSlots: BookedSlotLike[];
}): string[] {
  const { dateStr, dispos, dureeMinutes, battementMinutes, indispos, bookedSlots } = opts;

  if (isDateInIndispo(dateStr, indispos)) return [];
  const activePlages = dispos.filter((d) => d.actif);
  if (activePlages.length === 0) return [];

  const step = dureeMinutes + battementMinutes;
  const dayRes = bookedSlots.filter((r) => r.date_rdv === dateStr);

  const result: number[] = [];
  for (const plage of activePlages) {
    const debut = parseTimeStart(plage.heure_debut);
    const fin = parseTimeEnd(plage.heure_fin);
    if (fin <= debut) continue;

    for (let t = debut; t + dureeMinutes <= fin; t += step) {
      const slotEnd = t + dureeMinutes;
      const conflict = dayRes.some((r) => {
        const rStart = parseTimeStart(r.heure_rdv);
        const rDuree = r.prestation?.[0]?.duree_minutes ?? 60;
        const rEnd = rStart + rDuree;
        return t < rEnd && slotEnd > rStart;
      });
      if (!conflict) result.push(t);
    }
  }

  // Tri + dédoublonnage (au cas où 2 plages se chevaucheraient légèrement)
  const unique = Array.from(new Set(result)).sort((a, b) => a - b);
  return unique.map(formatSlot);
}

// Validation serveur stricte : retourne `null` si OK, ou un message d'erreur.
export type SlotValidationInput = {
  dateStr: string;
  heureStr: string;
  dureeMinutes: number;
  dispos: DisponibiliteSpecifique[]; // toutes les plages du jour
  indispos: Pick<Indisponibilite, "date_debut" | "date_fin">[];
  conflictingReservations: BookedSlotLike[];
  nowDateStr: string;
};

export function validateSlot(input: SlotValidationInput): { ok: true } | { ok: false; reason: string } {
  const { dateStr, heureStr, dureeMinutes, dispos, indispos, conflictingReservations, nowDateStr } =
    input;

  // 1. Date passée ou aujourd'hui (préavis 24h)
  if (dateStr <= nowDateStr) {
    return { ok: false, reason: "Date passée ou trop proche (préavis minimum)." };
  }

  // 2. Indisponibilité
  if (isDateInIndispo(dateStr, indispos)) {
    return { ok: false, reason: "Cette date est marquée indisponible." };
  }

  // 3. Au moins une plage active requise
  const activePlages = dispos.filter((d) => d.actif);
  if (activePlages.length === 0) {
    return { ok: false, reason: "Aucune disponibilité ouverte sur cette date." };
  }

  // 4. L'heure doit tomber dans AU MOINS UNE plage
  const slotStart = parseTimeStart(heureStr);
  const slotEnd = slotStart + dureeMinutes;
  const insidePlage = activePlages.some((p) => {
    const debut = parseTimeStart(p.heure_debut);
    const fin = parseTimeEnd(p.heure_fin);
    return slotStart >= debut && slotEnd <= fin;
  });
  if (!insidePlage) {
    return { ok: false, reason: "Le créneau choisi est hors des horaires d'ouverture." };
  }

  // 5. Conflit avec réservation existante
  const conflict = conflictingReservations.some((r) => {
    if (r.date_rdv !== dateStr) return false;
    const rStart = parseTimeStart(r.heure_rdv);
    const rDuree = r.prestation?.[0]?.duree_minutes ?? 60;
    const rEnd = rStart + rDuree;
    return slotStart < rEnd && slotEnd > rStart;
  });
  if (conflict) {
    return { ok: false, reason: "Ce créneau n'est plus disponible." };
  }

  return { ok: true };
}
