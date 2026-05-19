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

const plage = (
  opts: Partial<DisponibiliteSpecifique> & { date_jour: string; heure_debut: string; heure_fin: string }
): DisponibiliteSpecifique => ({
  id: `id-${opts.date_jour}-${opts.heure_debut}`,
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

describe("generateSlots — mono-plage", () => {
  const noIndispo: Array<{ date_debut: string; date_fin: string }> = [];
  const noBooked: BookedSlotLike[] = [];

  it("retourne [] si aucune plage", () => {
    expect(
      generateSlots({
        dateStr: "2026-05-20",
        dispos: [],
        dureeMinutes: 60,
        battementMinutes: 30,
        indispos: noIndispo,
        bookedSlots: noBooked,
      })
    ).toEqual([]);
  });

  it("retourne [] si toutes les plages sont inactives", () => {
    expect(
      generateSlots({
        dateStr: "2026-05-20",
        dispos: [
          plage({
            date_jour: "2026-05-20",
            heure_debut: "09:00:00",
            heure_fin: "12:00:00",
            actif: false,
          }),
        ],
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
      dispos: [plage({ date_jour: "2026-05-20", heure_debut: "09:00:00", heure_fin: "12:00:00" })],
      dureeMinutes: 60,
      battementMinutes: 30,
      indispos: noIndispo,
      bookedSlots: noBooked,
    });
    expect(slots).toEqual(["09:00", "10:30"]);
  });

  it("BUG-FIX critique : heure_fin = 00:00 traitée comme minuit fin de journée", () => {
    const slots = generateSlots({
      dateStr: "2026-05-20",
      dispos: [plage({ date_jour: "2026-05-20", heure_debut: "20:30:00", heure_fin: "00:00:00" })],
      dureeMinutes: 60,
      battementMinutes: 30,
      indispos: noIndispo,
      bookedSlots: noBooked,
    });
    expect(slots).toEqual(["20:30", "22:00"]);
  });

  it("retourne [] si la date est en indisponibilité", () => {
    expect(
      generateSlots({
        dateStr: "2026-05-20",
        dispos: [plage({ date_jour: "2026-05-20", heure_debut: "09:00:00", heure_fin: "12:00:00" })],
        dureeMinutes: 60,
        battementMinutes: 30,
        indispos: [{ date_debut: "2026-05-19", date_fin: "2026-05-21" }],
        bookedSlots: [],
      })
    ).toEqual([]);
  });

  it("exclut les créneaux qui chevauchent une réservation existante", () => {
    const slots = generateSlots({
      dateStr: "2026-05-20",
      dispos: [plage({ date_jour: "2026-05-20", heure_debut: "09:00:00", heure_fin: "13:00:00" })],
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
    expect(slots).toEqual(["09:00", "12:00"]);
  });
});

describe("generateSlots — multi-plages", () => {
  it("combine 2 plages distinctes, créneaux triés", () => {
    const slots = generateSlots({
      dateStr: "2026-05-20",
      dispos: [
        plage({ date_jour: "2026-05-20", heure_debut: "20:30:00", heure_fin: "00:00:00" }),
        plage({ date_jour: "2026-05-20", heure_debut: "08:30:00", heure_fin: "11:00:00" }),
      ],
      dureeMinutes: 60,
      battementMinutes: 30,
      indispos: [],
      bookedSlots: [],
    });
    // Plage 08:30-11:00 → 08:30, 10:00 (10:00+60=11:00 OK)
    // Plage 20:30-00:00 → 20:30, 22:00
    // Tri ascendant : 08:30, 10:00, 20:30, 22:00
    expect(slots).toEqual(["08:30", "10:00", "20:30", "22:00"]);
  });

  it("le battement ne saute PAS entre plages distinctes", () => {
    const slots = generateSlots({
      dateStr: "2026-05-20",
      dispos: [
        plage({ date_jour: "2026-05-20", heure_debut: "09:00:00", heure_fin: "10:00:00" }),
        plage({ date_jour: "2026-05-20", heure_debut: "10:00:00", heure_fin: "11:00:00" }),
      ],
      dureeMinutes: 60,
      battementMinutes: 30,
      indispos: [],
      bookedSlots: [],
    });
    // Plage 1 : 09:00 (09:00+60=10:00 ok). Plage 2 : 10:00 (10:00+60=11:00 ok)
    expect(slots).toEqual(["09:00", "10:00"]);
  });

  it("ignore les plages inactives mais traite les autres", () => {
    const slots = generateSlots({
      dateStr: "2026-05-20",
      dispos: [
        plage({ date_jour: "2026-05-20", heure_debut: "08:00:00", heure_fin: "09:30:00", actif: false }),
        plage({ date_jour: "2026-05-20", heure_debut: "14:00:00", heure_fin: "15:30:00" }),
      ],
      dureeMinutes: 60,
      battementMinutes: 30,
      indispos: [],
      bookedSlots: [],
    });
    expect(slots).toEqual(["14:00"]);
  });

  it("une réservation peut bloquer un créneau dans une plage sans affecter l'autre", () => {
    const slots = generateSlots({
      dateStr: "2026-05-20",
      dispos: [
        plage({ date_jour: "2026-05-20", heure_debut: "09:00:00", heure_fin: "12:00:00" }),
        plage({ date_jour: "2026-05-20", heure_debut: "14:00:00", heure_fin: "17:00:00" }),
      ],
      dureeMinutes: 60,
      battementMinutes: 30,
      indispos: [],
      bookedSlots: [
        {
          date_rdv: "2026-05-20",
          heure_rdv: "10:30:00",
          prestation: [{ duree_minutes: 60 }],
        },
      ],
    });
    // P1 : 09:00 ok, 10:30 conflit (sauté)
    // P2 : 14:00, 15:30
    expect(slots).toEqual(["09:00", "14:00", "15:30"]);
  });
});

describe("validateSlot — server-side validation", () => {
  const today = "2026-05-19";

  it("OK : créneau valide (1 plage)", () => {
    expect(
      validateSlot({
        dateStr: "2026-05-20",
        heureStr: "10:00",
        dureeMinutes: 60,
        dispos: [plage({ date_jour: "2026-05-20", heure_debut: "09:00:00", heure_fin: "18:00:00" })],
        indispos: [],
        conflictingReservations: [],
        nowDateStr: today,
      })
    ).toEqual({ ok: true });
  });

  it("OK : créneau dans la 2e plage (multi-plages)", () => {
    expect(
      validateSlot({
        dateStr: "2026-05-20",
        heureStr: "21:30",
        dureeMinutes: 60,
        dispos: [
          plage({ date_jour: "2026-05-20", heure_debut: "08:30:00", heure_fin: "11:00:00" }),
          plage({ date_jour: "2026-05-20", heure_debut: "20:30:00", heure_fin: "00:00:00" }),
        ],
        indispos: [],
        conflictingReservations: [],
        nowDateStr: today,
      })
    ).toEqual({ ok: true });
  });

  it("REJET : créneau ENTRE deux plages (multi-plages)", () => {
    const r = validateSlot({
      dateStr: "2026-05-20",
      heureStr: "13:00",
      dureeMinutes: 60,
      dispos: [
        plage({ date_jour: "2026-05-20", heure_debut: "08:30:00", heure_fin: "11:00:00" }),
        plage({ date_jour: "2026-05-20", heure_debut: "20:30:00", heure_fin: "00:00:00" }),
      ],
      indispos: [],
      conflictingReservations: [],
      nowDateStr: today,
    });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason).toMatch(/hors des horaires/i);
  });

  it("REJET : date passée", () => {
    const r = validateSlot({
      dateStr: "2026-05-18",
      heureStr: "10:00",
      dureeMinutes: 60,
      dispos: [plage({ date_jour: "2026-05-18", heure_debut: "09:00:00", heure_fin: "18:00:00" })],
      indispos: [],
      conflictingReservations: [],
      nowDateStr: today,
    });
    expect(r.ok).toBe(false);
  });

  it("REJET : aucune plage pour la date (CRITIQUE)", () => {
    const r = validateSlot({
      dateStr: "2026-05-23",
      heureStr: "13:30",
      dureeMinutes: 60,
      dispos: [],
      indispos: [],
      conflictingReservations: [],
      nowDateStr: today,
    });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason).toMatch(/Aucune disponibilité/i);
  });

  it("REJET : toutes les plages inactives", () => {
    const r = validateSlot({
      dateStr: "2026-05-20",
      heureStr: "10:00",
      dureeMinutes: 60,
      dispos: [
        plage({
          date_jour: "2026-05-20",
          heure_debut: "09:00:00",
          heure_fin: "18:00:00",
          actif: false,
        }),
      ],
      indispos: [],
      conflictingReservations: [],
      nowDateStr: today,
    });
    expect(r.ok).toBe(false);
  });

  it("REJET : heure hors plage (avant)", () => {
    const r = validateSlot({
      dateStr: "2026-05-20",
      heureStr: "08:00",
      dureeMinutes: 60,
      dispos: [plage({ date_jour: "2026-05-20", heure_debut: "09:00:00", heure_fin: "18:00:00" })],
      indispos: [],
      conflictingReservations: [],
      nowDateStr: today,
    });
    expect(r.ok).toBe(false);
  });

  it("REJET : heure hors plage (dépasse heure_fin)", () => {
    const r = validateSlot({
      dateStr: "2026-05-20",
      heureStr: "17:30",
      dureeMinutes: 60,
      dispos: [plage({ date_jour: "2026-05-20", heure_debut: "09:00:00", heure_fin: "18:00:00" })],
      indispos: [],
      conflictingReservations: [],
      nowDateStr: today,
    });
    expect(r.ok).toBe(false);
  });

  it("OK : heure_fin = 00:00 traitée comme minuit", () => {
    const r = validateSlot({
      dateStr: "2026-05-20",
      heureStr: "23:00",
      dureeMinutes: 60,
      dispos: [plage({ date_jour: "2026-05-20", heure_debut: "20:30:00", heure_fin: "00:00:00" })],
      indispos: [],
      conflictingReservations: [],
      nowDateStr: today,
    });
    expect(r.ok).toBe(true);
  });

  it("REJET : indisponibilité (CRITIQUE)", () => {
    const r = validateSlot({
      dateStr: "2026-05-20",
      heureStr: "10:00",
      dureeMinutes: 60,
      dispos: [plage({ date_jour: "2026-05-20", heure_debut: "09:00:00", heure_fin: "18:00:00" })],
      indispos: [{ date_debut: "2026-05-19", date_fin: "2026-05-25" }],
      conflictingReservations: [],
      nowDateStr: today,
    });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason).toMatch(/indisponible/i);
  });

  it("REJET : conflit avec une réservation existante", () => {
    const r = validateSlot({
      dateStr: "2026-05-20",
      heureStr: "10:30",
      dureeMinutes: 60,
      dispos: [plage({ date_jour: "2026-05-20", heure_debut: "09:00:00", heure_fin: "18:00:00" })],
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
      dispos: [plage({ date_jour: "2026-05-20", heure_debut: "09:00:00", heure_fin: "18:00:00" })],
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
