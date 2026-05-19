import { describe, expect, it } from "vitest";
import type { DisponibiliteSpecifique } from "@/lib/types";
import {
  dateToStr,
  formatSlot,
  generateSlots,
  isDateInIndispo,
  parseTimeEnd,
  parseTimeStart,
  validateSlot,
  type BookedSlotLike,
} from "@/lib/availability";

const dispo = (
  opts: Partial<DisponibiliteSpecifique> & { date_jour: string; heure_debut: string; heure_fin: string }
): DisponibiliteSpecifique => ({
  id: "id",
  actif: true,
  created_at: "2026-01-01T00:00:00Z",
  ...opts,
});

describe("parseTimeStart / parseTimeEnd", () => {
  it("parse HH:MM correctement", () => {
    expect(parseTimeStart("09:30")).toBe(9 * 60 + 30);
    expect(parseTimeStart("00:00")).toBe(0);
    expect(parseTimeStart("23:59")).toBe(23 * 60 + 59);
  });

  it("parse HH:MM:SS correctement", () => {
    expect(parseTimeStart("09:30:00")).toBe(9 * 60 + 30);
    expect(parseTimeStart("00:00:00")).toBe(0);
  });

  it("parseTimeEnd traite 00:00 comme minuit fin de journée (24h)", () => {
    expect(parseTimeEnd("00:00")).toBe(24 * 60);
    expect(parseTimeEnd("00:00:00")).toBe(24 * 60);
    expect(parseTimeEnd("19:00")).toBe(19 * 60);
  });
});

describe("formatSlot", () => {
  it("formate les minutes en HH:MM", () => {
    expect(formatSlot(0)).toBe("00:00");
    expect(formatSlot(9 * 60 + 30)).toBe("09:30");
    expect(formatSlot(23 * 60 + 5)).toBe("23:05");
  });
});

describe("dateToStr", () => {
  it("formate Date → YYYY-MM-DD (locale)", () => {
    expect(dateToStr(new Date(2026, 4, 19))).toBe("2026-05-19");
    expect(dateToStr(new Date(2026, 0, 1))).toBe("2026-01-01");
    expect(dateToStr(new Date(2026, 11, 31))).toBe("2026-12-31");
  });
});

describe("isDateInIndispo", () => {
  const indispos = [{ date_debut: "2026-05-20", date_fin: "2026-05-25" }];
  it("détecte un jour inclus", () => {
    expect(isDateInIndispo("2026-05-22", indispos)).toBe(true);
    expect(isDateInIndispo("2026-05-20", indispos)).toBe(true);
    expect(isDateInIndispo("2026-05-25", indispos)).toBe(true);
  });
  it("ignore un jour hors plage", () => {
    expect(isDateInIndispo("2026-05-19", indispos)).toBe(false);
    expect(isDateInIndispo("2026-05-26", indispos)).toBe(false);
  });
});

describe("generateSlots", () => {
  const noIndispo: Array<{ date_debut: string; date_fin: string }> = [];
  const noBooked: BookedSlotLike[] = [];

  it("retourne [] si pas de dispo", () => {
    expect(
      generateSlots({
        dateStr: "2026-05-20",
        dispo: undefined,
        dureeMinutes: 60,
        battementMinutes: 30,
        indispos: noIndispo,
        bookedSlots: noBooked,
      })
    ).toEqual([]);
  });

  it("retourne [] si dispo inactive", () => {
    expect(
      generateSlots({
        dateStr: "2026-05-20",
        dispo: dispo({
          date_jour: "2026-05-20",
          heure_debut: "09:00:00",
          heure_fin: "12:00:00",
          actif: false,
        }),
        dureeMinutes: 60,
        battementMinutes: 30,
        indispos: noIndispo,
        bookedSlots: noBooked,
      })
    ).toEqual([]);
  });

  it("génère les créneaux d'une plage simple 9h-12h, durée 60, battement 30", () => {
    const slots = generateSlots({
      dateStr: "2026-05-20",
      dispo: dispo({ date_jour: "2026-05-20", heure_debut: "09:00:00", heure_fin: "12:00:00" }),
      dureeMinutes: 60,
      battementMinutes: 30,
      indispos: noIndispo,
      bookedSlots: noBooked,
    });
    // step = 90. t=540 (09:00), t=630 (10:30). t=720 (12:00) → 12+60=13:00 > 12:00 → stop. Avant : 630+60=11:30 <= 12:00 OK
    expect(slots).toEqual(["09:00", "10:30"]);
  });

  it("BUG-FIX critique : heure_fin = 00:00 traitée comme minuit fin de journée", () => {
    const slots = generateSlots({
      dateStr: "2026-05-20",
      dispo: dispo({ date_jour: "2026-05-20", heure_debut: "20:30:00", heure_fin: "00:00:00" }),
      dureeMinutes: 60,
      battementMinutes: 30,
      indispos: noIndispo,
      bookedSlots: noBooked,
    });
    // step=90. t=1230(20:30), t=1320(22:00). 1320+60=23:00<=24:00 OK. t=1410(23:30) +60=24:30 > 24:00 stop.
    expect(slots).toEqual(["20:30", "22:00"]);
  });

  it("retourne [] si la date est en indisponibilité", () => {
    expect(
      generateSlots({
        dateStr: "2026-05-20",
        dispo: dispo({ date_jour: "2026-05-20", heure_debut: "09:00:00", heure_fin: "12:00:00" }),
        dureeMinutes: 60,
        battementMinutes: 30,
        indispos: [{ date_debut: "2026-05-19", date_fin: "2026-05-21" }],
        bookedSlots: noBooked,
      })
    ).toEqual([]);
  });

  it("exclut les créneaux qui chevauchent une réservation existante", () => {
    const slots = generateSlots({
      dateStr: "2026-05-20",
      dispo: dispo({ date_jour: "2026-05-20", heure_debut: "09:00:00", heure_fin: "13:00:00" }),
      dureeMinutes: 60,
      battementMinutes: 30,
      indispos: noIndispo,
      bookedSlots: [
        {
          date_rdv: "2026-05-20",
          heure_rdv: "10:30:00",
          prestation: [{ duree_minutes: 60 }],
        },
      ],
    });
    // step=90, t=09:00, t=10:30 (chevauche), t=12:00 (12+60=13 <=13 OK)
    expect(slots).toEqual(["09:00", "12:00"]);
  });
});

describe("validateSlot — server-side validation", () => {
  const today = "2026-05-19";

  it("OK : créneau valide", () => {
    expect(
      validateSlot({
        dateStr: "2026-05-20",
        heureStr: "10:00",
        dureeMinutes: 60,
        dispo: dispo({ date_jour: "2026-05-20", heure_debut: "09:00:00", heure_fin: "18:00:00" }),
        indispos: [],
        conflictingReservations: [],
        nowDateStr: today,
      })
    ).toEqual({ ok: true });
  });

  it("REJET : date passée", () => {
    const r = validateSlot({
      dateStr: "2026-05-18",
      heureStr: "10:00",
      dureeMinutes: 60,
      dispo: dispo({ date_jour: "2026-05-18", heure_debut: "09:00:00", heure_fin: "18:00:00" }),
      indispos: [],
      conflictingReservations: [],
      nowDateStr: today,
    });
    expect(r.ok).toBe(false);
  });

  it("REJET : date = aujourd'hui (préavis 24h)", () => {
    const r = validateSlot({
      dateStr: today,
      heureStr: "23:00",
      dureeMinutes: 60,
      dispo: dispo({ date_jour: today, heure_debut: "09:00:00", heure_fin: "00:00:00" }),
      indispos: [],
      conflictingReservations: [],
      nowDateStr: today,
    });
    expect(r.ok).toBe(false);
  });

  it("REJET : aucune dispo spécifique pour la date (CRITIQUE)", () => {
    const r = validateSlot({
      dateStr: "2026-05-23",
      heureStr: "13:30",
      dureeMinutes: 60,
      dispo: undefined,
      indispos: [],
      conflictingReservations: [],
      nowDateStr: today,
    });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason).toMatch(/Aucune disponibilité/i);
  });

  it("REJET : dispo inactive", () => {
    const r = validateSlot({
      dateStr: "2026-05-20",
      heureStr: "10:00",
      dureeMinutes: 60,
      dispo: dispo({
        date_jour: "2026-05-20",
        heure_debut: "09:00:00",
        heure_fin: "18:00:00",
        actif: false,
      }),
      indispos: [],
      conflictingReservations: [],
      nowDateStr: today,
    });
    expect(r.ok).toBe(false);
  });

  it("REJET : heure hors plage (avant heure_debut)", () => {
    const r = validateSlot({
      dateStr: "2026-05-20",
      heureStr: "08:00",
      dureeMinutes: 60,
      dispo: dispo({ date_jour: "2026-05-20", heure_debut: "09:00:00", heure_fin: "18:00:00" }),
      indispos: [],
      conflictingReservations: [],
      nowDateStr: today,
    });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason).toMatch(/hors des horaires/i);
  });

  it("REJET : heure hors plage (dépasse heure_fin)", () => {
    const r = validateSlot({
      dateStr: "2026-05-20",
      heureStr: "17:30",
      dureeMinutes: 60,
      dispo: dispo({ date_jour: "2026-05-20", heure_debut: "09:00:00", heure_fin: "18:00:00" }),
      indispos: [],
      conflictingReservations: [],
      nowDateStr: today,
    });
    // 17:30 + 60 = 18:30 > 18:00
    expect(r.ok).toBe(false);
  });

  it("OK : heure_fin = 00:00 traitée comme minuit (slot 23:00-23:59 valide)", () => {
    const r = validateSlot({
      dateStr: "2026-05-20",
      heureStr: "23:00",
      dureeMinutes: 60,
      dispo: dispo({ date_jour: "2026-05-20", heure_debut: "20:30:00", heure_fin: "00:00:00" }),
      indispos: [],
      conflictingReservations: [],
      nowDateStr: today,
    });
    expect(r.ok).toBe(true);
  });

  it("REJET : date marquée en indisponibilité (CRITIQUE)", () => {
    const r = validateSlot({
      dateStr: "2026-05-20",
      heureStr: "10:00",
      dureeMinutes: 60,
      dispo: dispo({ date_jour: "2026-05-20", heure_debut: "09:00:00", heure_fin: "18:00:00" }),
      indispos: [{ date_debut: "2026-05-19", date_fin: "2026-05-25" }],
      conflictingReservations: [],
      nowDateStr: today,
    });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason).toMatch(/indisponible/i);
  });

  it("REJET : conflit avec une réservation existante (chevauchement)", () => {
    const r = validateSlot({
      dateStr: "2026-05-20",
      heureStr: "10:30",
      dureeMinutes: 60,
      dispo: dispo({ date_jour: "2026-05-20", heure_debut: "09:00:00", heure_fin: "18:00:00" }),
      indispos: [],
      conflictingReservations: [
        {
          date_rdv: "2026-05-20",
          heure_rdv: "10:00:00",
          prestation: [{ duree_minutes: 60 }],
        },
      ],
      nowDateStr: today,
    });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason).toMatch(/n'est plus disponible/i);
  });

  it("OK : réservation existante sur une AUTRE date — n'affecte pas", () => {
    const r = validateSlot({
      dateStr: "2026-05-20",
      heureStr: "10:00",
      dureeMinutes: 60,
      dispo: dispo({ date_jour: "2026-05-20", heure_debut: "09:00:00", heure_fin: "18:00:00" }),
      indispos: [],
      conflictingReservations: [
        {
          date_rdv: "2026-05-21",
          heure_rdv: "10:00:00",
          prestation: [{ duree_minutes: 60 }],
        },
      ],
      nowDateStr: today,
    });
    expect(r.ok).toBe(true);
  });
});
