// Logique pure de disponibilités — partagée client / serveur.
// Single source of truth pour : parse temps, génération créneaux, validation.

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
  // Fin = 0 (minuit) → traité comme 24h (fin de journée)
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

// Génère les créneaux disponibles pour un jour donné.
// Retourne [] si :
//  - aucune dispo spécifique active pour ce jour
//  - le jour est en indisponibilité
//  - le jour est passé (par rapport à `now`)
// Filtre aussi les créneaux qui chevauchent une réservation existante.
export function generateSlots(opts: {
  dateStr: string;
  dispo: DisponibiliteSpecifique | undefined;
  dureeMinutes: number;
  battementMinutes: number;
  indispos: Pick<Indisponibilite, "date_debut" | "date_fin">[];
  bookedSlots: BookedSlotLike[];
}): string[] {
  const { dateStr, dispo, dureeMinutes, battementMinutes, indispos, bookedSlots } = opts;

  if (!dispo || !dispo.actif) return [];
  if (isDateInIndispo(dateStr, indispos)) return [];

  const debut = parseTimeStart(dispo.heure_debut);
  const fin = parseTimeEnd(dispo.heure_fin);
  if (fin <= debut) return [];

  const step = dureeMinutes + battementMinutes;
  const dayRes = bookedSlots.filter((r) => r.date_rdv === dateStr);

  const result: string[] = [];
  for (let t = debut; t + dureeMinutes <= fin; t += step) {
    const slotEnd = t + dureeMinutes;
    const conflict = dayRes.some((r) => {
      const rStart = parseTimeStart(r.heure_rdv);
      const rDuree = r.prestation?.[0]?.duree_minutes ?? 60;
      const rEnd = rStart + rDuree;
      return t < rEnd && slotEnd > rStart;
    });
    if (!conflict) result.push(formatSlot(t));
  }
  return result;
}

// Validation serveur stricte : retourne `null` si OK, ou un message d'erreur.
export type SlotValidationInput = {
  dateStr: string;
  heureStr: string; // "HH:MM" ou "HH:MM:SS"
  dureeMinutes: number;
  dispo: DisponibiliteSpecifique | undefined;
  indispos: Pick<Indisponibilite, "date_debut" | "date_fin">[];
  conflictingReservations: BookedSlotLike[]; // toutes les réservations sur cette date qui doivent être considérées comme bloquantes
  nowDateStr: string; // dateToStr(now) côté serveur
};

export function validateSlot(input: SlotValidationInput): { ok: true } | { ok: false; reason: string } {
  const { dateStr, heureStr, dureeMinutes, dispo, indispos, conflictingReservations, nowDateStr } =
    input;

  // 1. Date dans le passé ou aujourd'hui (24h de préavis)
  if (dateStr <= nowDateStr) {
    return { ok: false, reason: "Date passée ou trop proche (préavis minimum)." };
  }

  // 2. Indisponibilité
  if (isDateInIndispo(dateStr, indispos)) {
    return { ok: false, reason: "Cette date est marquée indisponible." };
  }

  // 3. Dispo spécifique active requise
  if (!dispo || !dispo.actif) {
    return { ok: false, reason: "Aucune disponibilité ouverte sur cette date." };
  }

  // 4. Heure dans la plage [heure_debut, heure_fin]
  const debut = parseTimeStart(dispo.heure_debut);
  const fin = parseTimeEnd(dispo.heure_fin);
  const slotStart = parseTimeStart(heureStr);
  const slotEnd = slotStart + dureeMinutes;
  if (slotStart < debut || slotEnd > fin) {
    return { ok: false, reason: "Le créneau choisi est hors des horaires d'ouverture." };
  }

  // 5. Conflit avec réservation existante (chevauchement)
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
