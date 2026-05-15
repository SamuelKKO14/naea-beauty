"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { Calendar, Check, ChevronLeft, ChevronRight, Clock, Copy, CreditCard, X } from "lucide-react";
import { createClient } from "@/lib/supabase";
import type { Prestation, Disponibilite, Indisponibilite } from "@/lib/types";

type BookedSlot = {
  date_rdv: string;
  heure_rdv: string;
  prestation_id: string;
  statut: string;
  acompte_paye: boolean;
  prestation: { duree_minutes: number }[] | null;
};

type Status = "idle" | "loading" | "success" | "error";

type BookingResult = {
  reservation_id: string;
  montant_total: number;
  montant_acompte: number;
};

const inputClass =
  "w-full rounded-lg border border-bordeaux-200 bg-white px-4 py-3 text-bordeaux-950 placeholder:text-gray-400 outline-none transition-all focus:border-or-500 focus:shadow-[0_0_0_3px_rgba(201,169,97,0.12)]";

const labelClass = "mb-1.5 block text-sm font-medium text-bordeaux-900";

const JOUR_LABELS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
const MOIS_LABELS = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre",
];

// Convertir JS day (0=dim) en DB jour_semaine (0=lundi)
function jsToDbDay(jsDay: number): number {
  return (jsDay + 6) % 7;
}

function parseTime(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + (m || 0);
}

function formatTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}h${m.toString().padStart(2, "0")}`;
}

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function dateToStr(d: Date) {
  return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, "0")}-${d.getDate().toString().padStart(2, "0")}`;
}

export function ReservationForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [bookingResult, setBookingResult] = useState<BookingResult | null>(null);
  const [showVirement, setShowVirement] = useState(false);
  const [ibanCopied, setIbanCopied] = useState(false);
  const supabase = createClient();

  // Data
  const [prestations, setPrestations] = useState<Prestation[]>([]);
  const [dispos, setDispos] = useState<Disponibilite[]>([]);
  const [indispos, setIndispos] = useState<Indisponibilite[]>([]);
  const [reservations, setReservations] = useState<BookedSlot[]>([]);
  const [battement, setBattement] = useState(30);

  // Form state
  const [selectedPrestation, setSelectedPrestation] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string>("");
  const [lieu, setLieu] = useState<"chez_naea" | "domicile">("chez_naea");
  const [prenom, setPrenom] = useState("");
  const [nom, setNom] = useState("");
  const [telephone, setTelephone] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [cgvAccepted, setCgvAccepted] = useState(false);
  const [showCgv, setShowCgv] = useState(false);

  // Calendar
  const [calMonth, setCalMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  // --- Fetch data ---
  useEffect(() => {
    async function load() {
      const [presRes, dispoRes, indispoRes, paramRes] = await Promise.all([
        supabase.from("prestations").select("*").eq("actif", true).order("ordre"),
        supabase.from("disponibilites").select("*").eq("actif", true),
        supabase.from("indisponibilites").select("*"),
        supabase.from("parametres").select("valeur").eq("cle", "battement_minutes").single(),
      ]);
      setPrestations(presRes.data || []);
      setDispos(dispoRes.data || []);
      setIndispos(indispoRes.data || []);
      if (paramRes.data) setBattement(parseInt(paramRes.data.valeur, 10) || 30);
    }
    load();
  }, []);

  // Fetch reservations when date changes (month scope)
  useEffect(() => {
    async function loadReservations() {
      const start = dateToStr(calMonth);
      const end = dateToStr(new Date(calMonth.getFullYear(), calMonth.getMonth() + 2, 0));
      const { data } = await supabase
        .from("reservations")
        .select("date_rdv, heure_rdv, prestation_id, statut, acompte_paye, prestation:prestations(duree_minutes)")
        .gte("date_rdv", start)
        .lte("date_rdv", end)
        .in("statut", ["confirmee", "realisee"])
        .eq("acompte_paye", true);
      setReservations((data as BookedSlot[]) || []);
    }
    loadReservations();
  }, [calMonth]);

  // --- Prestation sélectionnée ---
  const prestation = useMemo(
    () => prestations.find((p) => p.id === selectedPrestation),
    [prestations, selectedPrestation]
  );

  // --- Jours disponibles map: dbDay -> Disponibilite ---
  const dispoMap = useMemo(() => {
    const m = new Map<number, Disponibilite>();
    dispos.forEach((d) => m.set(d.jour_semaine, d));
    return m;
  }, [dispos]);

  // --- Is date indisponible ---
  const isIndispo = useCallback(
    (date: Date) => {
      const ds = dateToStr(date);
      return indispos.some((i) => ds >= i.date_debut && ds <= i.date_fin);
    },
    [indispos]
  );

  // --- Is date available (base check, without fully-booked) ---
  const isDateBaseAvailable = useCallback(
    (date: Date) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (date < today) return false;
      if (isSameDay(date, today)) return false;
      if (isIndispo(date)) return false;
      const dbDay = jsToDbDay(date.getDay());
      return dispoMap.has(dbDay);
    },
    [dispoMap, isIndispo]
  );

  // --- Générer les créneaux pour la date sélectionnée ---
  const slots = useMemo(() => {
    if (!selectedDate || !prestation) return [];
    const dbDay = jsToDbDay(selectedDate.getDay());
    const dispo = dispoMap.get(dbDay);
    if (!dispo) return [];

    const debut = parseTime(dispo.heure_debut);
    const fin = parseTime(dispo.heure_fin);
    const duree = prestation.duree_minutes;
    const step = duree + battement;
    const dateStr = dateToStr(selectedDate);

    // Réservations ce jour-là
    const dayRes = reservations.filter((r) => r.date_rdv === dateStr);

    const result: string[] = [];
    for (let t = debut; t + duree <= fin; t += step) {
      const slotStr = `${Math.floor(t / 60).toString().padStart(2, "0")}:${(t % 60).toString().padStart(2, "0")}`;

      // Vérifier chevauchement avec réservations existantes
      const conflict = dayRes.some((r) => {
        const rStart = parseTime(r.heure_rdv);
        const rDuree = r.prestation?.[0]?.duree_minutes || 60;
        const rEnd = rStart + rDuree;
        const slotEnd = t + duree;
        return t < rEnd && slotEnd > rStart;
      });

      if (!conflict) result.push(slotStr);
    }
    return result;
  }, [selectedDate, prestation, dispoMap, reservations, battement]);

  // Reset slot when date or prestation changes
  useEffect(() => {
    setSelectedSlot("");
  }, [selectedDate, selectedPrestation]);

  // Reset date when prestation changes
  useEffect(() => {
    setSelectedDate(null);
  }, [selectedPrestation]);

  // --- Calendar rendering ---
  const calDays = useMemo(() => {
    const year = calMonth.getFullYear();
    const month = calMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    // Jour de la semaine du 1er (lundi = 0)
    let startOffset = (firstDay.getDay() + 6) % 7;
    const days: (Date | null)[] = [];

    for (let i = 0; i < startOffset; i++) days.push(null);
    for (let d = 1; d <= lastDay.getDate(); d++) {
      days.push(new Date(year, month, d));
    }
    return days;
  }, [calMonth]);

  // --- Dates entièrement réservées (tous les créneaux pris par confirmées+payées) ---
  const fullyBookedDates = useMemo(() => {
    if (!prestation) return new Set<string>();
    const booked = new Set<string>();
    const duree = prestation.duree_minutes;

    for (const day of calDays) {
      if (!day) continue;
      if (!isDateBaseAvailable(day)) continue;
      const dbDay = jsToDbDay(day.getDay());
      const dispo = dispoMap.get(dbDay);
      if (!dispo) continue;

      const debut = parseTime(dispo.heure_debut);
      const fin = parseTime(dispo.heure_fin);
      const step = duree + battement;
      const dateStr = dateToStr(day);
      const dayRes = reservations.filter((r) => r.date_rdv === dateStr);

      if (dayRes.length === 0) continue; // Pas de réservation = pas full

      let allTaken = true;
      for (let t = debut; t + duree <= fin; t += step) {
        const conflict = dayRes.some((r) => {
          const rStart = parseTime(r.heure_rdv);
          const rDuree = r.prestation?.[0]?.duree_minutes || 60;
          const rEnd = rStart + rDuree;
          return t < rEnd && (t + duree) > rStart;
        });
        if (!conflict) { allTaken = false; break; }
      }
      if (allTaken) booked.add(dateStr);
    }
    return booked;
  }, [prestation, calDays, isDateBaseAvailable, dispoMap, reservations, battement]);

  // --- Is date available (final, includes fully-booked check) ---
  const isDateAvailable = useCallback(
    (date: Date) => {
      if (!isDateBaseAvailable(date)) return false;
      if (fullyBookedDates.has(dateToStr(date))) return false;
      return true;
    },
    [isDateBaseAvailable, fullyBookedDates]
  );

  // --- Submit --- Anti double-submit : useRef + useState
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submittingRef = useRef(false);

  async function handleSubmit() {
    if (submittingRef.current) return;
    if (!selectedPrestation || !selectedDate || !selectedSlot || !prenom || !nom || !email || !telephone || !cgvAccepted) return;

    submittingRef.current = true;
    setIsSubmitting(true);
    setStatus("loading");
    setErrorMsg("");

    try {
      const res = await fetch("/api/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prestation_id: selectedPrestation,
          date_rdv: dateToStr(selectedDate),
          heure_rdv: selectedSlot,
          lieu,
          prenom,
          nom,
          email,
          telephone,
          notes_client: notes || null,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Erreur");
      }

      setBookingResult({
        reservation_id: data.reservation_id,
        montant_total: data.montant_total,
        montant_acompte: data.montant_acompte,
      });
      setStatus("success");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Une erreur est survenue.");
      setStatus("error");
    } finally {
      submittingRef.current = false;
      setIsSubmitting(false);
    }
  }

  function copyIban() {
    navigator.clipboard.writeText("FR7616798000010001423822381");
    setIbanCopied(true);
    setTimeout(() => setIbanCopied(false), 2000);
  }

  const shortId = bookingResult?.reservation_id?.slice(0, 8).toUpperCase() || "";

  // --- Success ---
  if (status === "success" && bookingResult && prestation && selectedDate) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-or-100">
            <Check className="text-or-700" size={32} />
          </div>
          <h3 className="mt-5 font-display text-2xl text-bordeaux-900">
            Réservation enregistrée !
          </h3>
          <p className="mt-2 text-sm text-bordeaux-900/70">
            Pour confirmer votre rendez-vous, versez l&apos;acompte de{" "}
            <strong>{bookingResult.montant_acompte} €</strong>
          </p>
        </div>

        {/* Récapitulatif */}
        <div className="rounded-lg border border-or-200 bg-or-50/50 px-5 py-4">
          <p className="text-sm font-semibold text-bordeaux-900">Récapitulatif</p>
          <dl className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm">
            <dt className="text-bordeaux-900/60">Prestation</dt>
            <dd className="text-bordeaux-900">{prestation.nom}</dd>
            <dt className="text-bordeaux-900/60">Date</dt>
            <dd className="text-bordeaux-900">
              {selectedDate.toLocaleDateString("fr-FR", {
                weekday: "long",
                day: "numeric",
                month: "long",
              })}{" "}
              à {formatTime(parseTime(selectedSlot))}
            </dd>
            <dt className="text-bordeaux-900/60">Lieu</dt>
            <dd className="text-bordeaux-900">
              {lieu === "chez_naea" ? "Chez Naéa" : "À domicile"}
            </dd>
            <dt className="text-bordeaux-900/60">Montant total</dt>
            <dd className="text-bordeaux-900">{bookingResult.montant_total} €</dd>
            <dt className="text-bordeaux-900/60">Acompte à verser</dt>
            <dd className="font-semibold text-bordeaux-900">{bookingResult.montant_acompte} € (50%)</dd>
          </dl>
        </div>

        {/* Options de paiement */}
        <div className="grid gap-4 sm:grid-cols-2">
          {/* PayPal */}
          <div className="rounded-xl border border-bordeaux-100 bg-white p-5">
            <h4 className="text-sm font-semibold text-bordeaux-900">PayPal</h4>
            <a
              href={`https://paypal.me/NAEABEAUTY/${bookingResult.montant_acompte}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-full bg-or-500 px-6 py-3 text-sm font-semibold text-bordeaux-950 shadow-md transition-all hover:shadow-lg hover:shadow-or-500/30"
            >
              <CreditCard size={16} />
              Payer par PayPal
            </a>
            <p className="mt-3 text-xs text-bordeaux-900/60">
              Envoyez {bookingResult.montant_acompte} € et indiquez votre nom en message
            </p>
          </div>

          {/* Virement */}
          <div className="rounded-xl border border-bordeaux-100 bg-white p-5">
            <h4 className="text-sm font-semibold text-bordeaux-900">Virement bancaire</h4>
            {!showVirement ? (
              <button
                type="button"
                onClick={() => setShowVirement(true)}
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-full border-2 border-bordeaux-200 px-6 py-3 text-sm font-semibold text-bordeaux-900 transition-all hover:border-bordeaux-400 hover:bg-bordeaux-50"
              >
                Payer par virement
              </button>
            ) : (
              <div className="mt-3 space-y-2 text-sm">
                <div className="rounded-lg bg-bordeaux-50/50 p-3 text-xs">
                  <p><span className="text-bordeaux-900/60">Titulaire :</span> <strong>Amina Saydoullayeva</strong></p>
                  <p className="mt-1"><span className="text-bordeaux-900/60">IBAN :</span> <strong className="font-mono">FR76 1679 8000 0100 0142 3822 381</strong></p>
                  <p className="mt-1"><span className="text-bordeaux-900/60">BIC :</span> <strong className="font-mono">TRZOFR21XXX</strong></p>
                  <p className="mt-1"><span className="text-bordeaux-900/60">Montant :</span> <strong>{bookingResult.montant_acompte} €</strong></p>
                  <p className="mt-1"><span className="text-bordeaux-900/60">Référence :</span> <strong className="font-mono">NAEA-{shortId}</strong></p>
                </div>
                <button
                  type="button"
                  onClick={copyIban}
                  className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-bordeaux-200 px-3 py-2 text-xs font-medium text-bordeaux-700 transition-colors hover:bg-bordeaux-50"
                >
                  <Copy size={12} />
                  {ibanCopied ? "IBAN copié !" : "Copier l'IBAN"}
                </button>
                <p className="text-xs text-bordeaux-900/60">
                  Votre RDV sera confirmé dès réception du virement (sous 24-48h)
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="space-y-3 text-center">
          <p className="text-xs text-bordeaux-900/60">
            Vous recevrez un email de confirmation dès que votre acompte est vérifié.
          </p>
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="text-sm font-medium text-bordeaux-700 underline underline-offset-2 hover:text-bordeaux-900"
          >
            Retour au site
          </button>
        </div>
      </div>
    );
  }

  const today = new Date();
  const canGoPrev =
    calMonth.getFullYear() > today.getFullYear() ||
    (calMonth.getFullYear() === today.getFullYear() && calMonth.getMonth() > today.getMonth());

  return (
    <div className="space-y-5">
      <h3 className="font-display text-2xl text-bordeaux-900">
        Réserver votre rendez-vous
      </h3>

      {/* Prestation */}
      <div>
        <label className={labelClass}>
          Prestation souhaitée <span className="text-or-700">*</span>
        </label>
        <select
          value={selectedPrestation}
          onChange={(e) => setSelectedPrestation(e.target.value)}
          required
          className={inputClass}
        >
          <option value="" disabled className="text-gray-400">
            Choisir une prestation
          </option>
          {prestations.map((p) => (
            <option key={p.id} value={p.id}>
              {p.nom} — {p.prix} €
            </option>
          ))}
        </select>
      </div>

      {/* Calendrier */}
      {selectedPrestation && (
        <div>
          <label className={labelClass}>
            Date souhaitée <span className="text-or-700">*</span>
          </label>
          <div className="rounded-lg border border-bordeaux-200 bg-white p-4">
            {/* Header mois */}
            <div className="mb-3 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setCalMonth(new Date(calMonth.getFullYear(), calMonth.getMonth() - 1, 1))}
                disabled={!canGoPrev}
                className="rounded p-1 text-bordeaux-700 hover:bg-bordeaux-50 disabled:opacity-30"
              >
                <ChevronLeft size={20} />
              </button>
              <span className="text-sm font-semibold text-bordeaux-900">
                {MOIS_LABELS[calMonth.getMonth()]} {calMonth.getFullYear()}
              </span>
              <button
                type="button"
                onClick={() => setCalMonth(new Date(calMonth.getFullYear(), calMonth.getMonth() + 1, 1))}
                className="rounded p-1 text-bordeaux-700 hover:bg-bordeaux-50"
              >
                <ChevronRight size={20} />
              </button>
            </div>

            {/* Jours de la semaine */}
            <div className="mb-1 grid grid-cols-7 text-center text-xs font-medium text-bordeaux-900/50">
              {JOUR_LABELS.map((j) => (
                <div key={j} className="py-1">{j}</div>
              ))}
            </div>

            {/* Jours */}
            <div className="grid grid-cols-7 gap-0.5">
              {calDays.map((day, i) => {
                if (!day) return <div key={`e-${i}`} />;
                const available = isDateAvailable(day);
                const selected = selectedDate && isSameDay(day, selectedDate);
                return (
                  <button
                    key={day.toISOString()}
                    type="button"
                    disabled={!available}
                    onClick={() => setSelectedDate(day)}
                    className={`rounded-lg py-2 text-sm transition-all ${
                      selected
                        ? "bg-or-500 font-semibold text-bordeaux-950"
                        : available
                          ? "text-bordeaux-900 hover:bg-or-50"
                          : "text-gray-300 cursor-default"
                    }`}
                  >
                    {day.getDate()}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Créneaux horaires */}
      {selectedDate && prestation && (
        <div>
          <label className={labelClass}>
            <Clock size={14} className="mr-1 inline" />
            Créneau horaire <span className="text-or-700">*</span>
          </label>
          {slots.length === 0 ? (
            <p className="text-sm text-bordeaux-900/60">
              Aucun créneau disponible ce jour. Essayez une autre date.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {slots.map((slot) => (
                <button
                  key={slot}
                  type="button"
                  onClick={() => setSelectedSlot(slot)}
                  className={`rounded-lg border px-4 py-2.5 text-sm font-medium transition-all ${
                    selectedSlot === slot
                      ? "border-or-500 bg-or-500 text-bordeaux-950"
                      : "border-bordeaux-200 text-bordeaux-900 hover:border-or-300 hover:bg-or-50"
                  }`}
                >
                  {formatTime(parseTime(slot))}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Lieu */}
      <fieldset>
        <legend className="mb-2 text-sm font-medium text-bordeaux-900">
          Lieu <span className="text-or-700">*</span>
        </legend>
        <div className="flex flex-col gap-2 sm:flex-row sm:gap-6">
          <label className="flex cursor-pointer items-center gap-2 text-sm text-bordeaux-900">
            <input
              type="radio"
              name="location"
              value="chez_naea"
              checked={lieu === "chez_naea"}
              onChange={() => setLieu("chez_naea")}
              className="accent-or-500"
            />
            Chez Naéa, Nantes
          </label>
          <label className="flex cursor-pointer items-center gap-2 text-sm text-bordeaux-900">
            <input
              type="radio"
              name="location"
              value="domicile"
              checked={lieu === "domicile"}
              onChange={() => setLieu("domicile")}
              className="accent-or-500"
            />
            À mon domicile
          </label>
        </div>
      </fieldset>

      {/* Prénom + Nom */}
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className={labelClass}>
            Prénom <span className="text-or-700">*</span>
          </label>
          <input
            type="text"
            required
            value={prenom}
            onChange={(e) => setPrenom(e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>
            Nom <span className="text-or-700">*</span>
          </label>
          <input
            type="text"
            required
            value={nom}
            onChange={(e) => setNom(e.target.value)}
            className={inputClass}
          />
        </div>
      </div>

      {/* Téléphone + Email */}
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className={labelClass}>
            Téléphone <span className="text-or-700">*</span>
          </label>
          <input
            type="tel"
            required
            value={telephone}
            onChange={(e) => setTelephone(e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>
            Email <span className="text-or-700">*</span>
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClass}
          />
        </div>
      </div>

      {/* Message */}
      <div>
        <label className={labelClass}>
          Message complémentaire (optionnel)
        </label>
        <textarea
          rows={3}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Précisez vos disponibilités, questions, attentes..."
          className={`${inputClass} resize-none`}
        />
      </div>

      {/* Récapitulatif */}
      {prestation && selectedDate && selectedSlot && (
        <div className="rounded-lg border border-or-200 bg-or-50/50 px-4 py-3">
          <p className="text-sm font-medium text-bordeaux-900">Récapitulatif</p>
          <p className="mt-1 text-sm text-bordeaux-900/80">
            {prestation.nom} — {prestation.prix} € — Le{" "}
            {selectedDate.toLocaleDateString("fr-FR", {
              weekday: "long",
              day: "numeric",
              month: "long",
            })}{" "}
            à {formatTime(parseTime(selectedSlot))} —{" "}
            {lieu === "chez_naea" ? "Chez Naéa" : "À domicile"}
          </p>
        </div>
      )}

      {/* CGV checkbox */}
      <label className="flex cursor-pointer items-start gap-2.5">
        <input
          type="checkbox"
          checked={cgvAccepted}
          onChange={(e) => setCgvAccepted(e.target.checked)}
          className="mt-0.5 shrink-0 accent-or-500"
        />
        <span className="text-xs leading-relaxed text-bordeaux-900/70">
          J&apos;accepte les{" "}
          <button
            type="button"
            onClick={() => setShowCgv(true)}
            className="font-medium text-or-700 underline underline-offset-2 hover:text-or-900"
          >
            conditions de réservation
          </button>{" "}
          et la politique d&apos;acompte non-remboursable (50% du montant, non restituable en cas d&apos;annulation).
        </span>
      </label>

      {/* Modale CGV */}
      {showCgv && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setShowCgv(false)}
        >
          <div
            className="relative max-h-[80vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setShowCgv(false)}
              className="absolute right-4 top-4 rounded-full p-1 text-bordeaux-600 hover:bg-bordeaux-50"
            >
              <X size={20} />
            </button>
            <h3 className="font-display text-xl text-bordeaux-900">
              Conditions de réservation — Naéa Beauty
            </h3>
            <ul className="mt-5 space-y-3 text-sm leading-relaxed text-bordeaux-900/80">
              <li>• Un acompte de 50% du montant de la prestation est demandé pour confirmer votre rendez-vous.</li>
              <li>• L&apos;acompte est non-remboursable en cas d&apos;annulation.</li>
              <li>• Toute annulation doit être signalée au moins 24 heures à l&apos;avance.</li>
              <li>• En cas de retard de plus de 15 minutes sans prévenir, le rendez-vous pourra être annulé et l&apos;acompte conservé.</li>
              <li>• Les prestations sont réalisées à Nantes, à domicile ou chez Naéa Beauty.</li>
              <li>• Les résultats peuvent varier selon la nature des cils, sourcils ou dents de chaque cliente.</li>
              <li>• En réservant, vous confirmez ne pas avoir de contre-indications connues aux soins choisis.</li>
            </ul>
            <button
              type="button"
              onClick={() => setShowCgv(false)}
              className="mt-6 w-full rounded-full bg-or-500 px-6 py-3 text-sm font-semibold text-bordeaux-950 transition-all hover:bg-or-400"
            >
              Fermer
            </button>
          </div>
        </div>
      )}

      {/* Submit — type="button" pour éviter double submit via form */}
      <button
        type="button"
        onClick={handleSubmit}
        disabled={isSubmitting || status === "loading" || !selectedPrestation || !selectedDate || !selectedSlot || !cgvAccepted}
        className="group relative inline-flex w-full items-center justify-center gap-2 overflow-hidden rounded-full bg-or-500 px-8 py-4 text-sm font-semibold uppercase tracking-wider text-bordeaux-950 shadow-lg shadow-or-500/20 transition-all hover:shadow-xl hover:shadow-or-500/40 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <span className="pointer-events-none absolute inset-0 animate-shimmer-gold bg-gradient-to-r from-transparent via-white/40 to-transparent" />
        <span className="pointer-events-none absolute inset-0 rounded-full bg-or-300/0 transition-colors group-hover:bg-or-300/20" />
        <Calendar size={16} className="relative z-10" />
        <span className="relative z-10">
          {status === "loading" ? "Envoi..." : "Demander mon RDV"}
        </span>
      </button>

      <p className="text-center text-sm text-bordeaux-900/60">
        Je vous reviens dans la journée pour confirmer votre créneau.
      </p>

      {status === "error" && (
        <p className="text-center text-sm text-bordeaux-700">
          {errorMsg || "Une erreur est survenue."} Vous pouvez aussi me contacter sur Instagram @naea_beauty.
        </p>
      )}
    </div>
  );
}
