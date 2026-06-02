"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import {
  AnimatePresence,
  motion,
  type MotionProps,
} from "framer-motion";
import {
  ArrowLeft,
  Calendar,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  Copy,
  CreditCard,
  Sparkles,
} from "lucide-react";
import { createClient } from "@/lib/supabase";
import type { Prestation, DisponibiliteSpecifique, Indisponibilite } from "@/lib/types";
import {
  dateToStr,
  generateSlots,
  isDateInIndispo,
  parseTimeStart,
} from "@/lib/availability";

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
  prestation_prix?: number;
  supplement?: number;
};

const inputClass =
  "w-full rounded-lg border border-bordeaux-200 bg-white px-4 py-3 text-bordeaux-950 placeholder:text-gray-400 outline-none transition-all focus:border-or-500 focus:shadow-[0_0_0_3px_rgba(201,169,97,0.12)]";

const labelClass = "mb-1.5 block text-sm font-medium text-bordeaux-900";

const JOUR_LABELS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
const MOIS_LABELS = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre",
];

function formatTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}h${m.toString().padStart(2, "0")}`;
}

function formatPrice(n: number): string {
  return Number(n).toFixed(2).replace(".", ",").replace(",00", "") + " €";
}

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

const STEPS = [
  "Soin",
  "Date",
  "Vos infos",
  "Paiement",
] as const;

type StepIdx = 0 | 1 | 2 | 3;

/* ─── Slide motion preset ─────────────────────────────── */
const slideVariants: MotionProps["variants"] = {
  enter: (dir: number) => ({ x: dir > 0 ? 60 : -60, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -60 : 60, opacity: 0 }),
};

/* ─── Stepper header ──────────────────────────────────── */
function Stepper({ step }: { step: StepIdx }) {
  return (
    <ol className="mb-8 flex items-center justify-between gap-1 sm:gap-2">
      {STEPS.map((label, i) => {
        const status: "done" | "current" | "todo" =
          i < step ? "done" : i === step ? "current" : "todo";
        return (
          <li key={label} className="flex flex-1 items-center">
            <div className="flex flex-col items-center">
              <span
                className={`grid h-8 w-8 place-items-center rounded-full text-xs font-semibold transition-all ${
                  status === "done"
                    ? "bg-green-600 text-white"
                    : status === "current"
                      ? "bg-or-500 text-bordeaux-950 ring-4 ring-or-500/20"
                      : "border border-bordeaux-200 bg-white text-bordeaux-400"
                }`}
              >
                {status === "done" ? <Check size={14} /> : i + 1}
              </span>
              <span
                className={`mt-1.5 hidden text-[10px] uppercase tracking-wide sm:block ${
                  status === "todo" ? "text-bordeaux-400" : "text-bordeaux-700"
                }`}
              >
                {label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <span
                aria-hidden
                className={`mx-1 h-px flex-1 transition-colors sm:mx-2 ${
                  i < step ? "bg-green-600" : "bg-bordeaux-200"
                }`}
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}

/* ─── ReservationForm ─────────────────────────────────── */
export function ReservationForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [bookingResult, setBookingResult] = useState<BookingResult | null>(null);
  const [showVirement, setShowVirement] = useState(false);
  const [ibanCopied, setIbanCopied] = useState(false);
  const supabase = createClient();

  // Data
  const [prestations, setPrestations] = useState<Prestation[]>([]);
  const [dispos, setDispos] = useState<DisponibiliteSpecifique[]>([]);
  const [indispos, setIndispos] = useState<Indisponibilite[]>([]);
  const [reservations, setReservations] = useState<BookedSlot[]>([]);
  const [battement, setBattement] = useState(30);
  const [supplementDomicile, setSupplementDomicile] = useState(5);

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

  // Stepper
  const [step, setStep] = useState<StepIdx>(0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const formTopRef = useRef<HTMLDivElement>(null);

  function goTo(next: StepIdx) {
    setDirection(next > step ? 1 : -1);
    setStep(next);
    requestAnimationFrame(() => {
      formTopRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  // Calendar
  const [calMonth, setCalMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  // --- Fetch data ---
  useEffect(() => {
    async function load() {
      const [presRes, indispoRes, paramRes] = await Promise.all([
        supabase.from("prestations").select("*").eq("actif", true).order("ordre"),
        supabase.from("indisponibilites").select("*"),
        supabase.from("parametres").select("cle, valeur").in("cle", ["battement_minutes", "supplement_domicile"]),
      ]);
      setPrestations(presRes.data || []);
      setIndispos(indispoRes.data || []);
      for (const p of paramRes.data || []) {
        if (p.cle === "battement_minutes") setBattement(parseInt(p.valeur, 10) || 30);
        if (p.cle === "supplement_domicile") setSupplementDomicile(parseFloat(p.valeur) || 5);
      }
    }
    load();
  }, []);

  // Fetch reservations + dispos when month changes
  useEffect(() => {
    async function loadMonthData() {
      const start = dateToStr(calMonth);
      const end = dateToStr(new Date(calMonth.getFullYear(), calMonth.getMonth() + 2, 0));
      const [resRes, dispoRes] = await Promise.all([
        supabase
          .from("reservations")
          .select("date_rdv, heure_rdv, prestation_id, statut, acompte_paye, prestation:prestations(duree_minutes)")
          .gte("date_rdv", start)
          .lte("date_rdv", end)
          .in("statut", ["confirmee", "realisee"])
          .eq("acompte_paye", true),
        supabase
          .from("disponibilites_specifiques")
          .select("*")
          .eq("actif", true)
          .gte("date_jour", start)
          .lte("date_jour", end),
      ]);
      setReservations((resRes.data as BookedSlot[]) || []);
      setDispos(dispoRes.data || []);
    }
    loadMonthData();
  }, [calMonth]);

  // --- Prestation sélectionnée ---
  const prestation = useMemo(
    () => prestations.find((p) => p.id === selectedPrestation),
    [prestations, selectedPrestation]
  );

  // --- Calcul prix en temps réel (le serveur reste la source de vérité) ---
  const supplementActif = lieu === "domicile" ? supplementDomicile : 0;
  const prixPrestation = prestation?.prix ?? 0;
  const totalEstime = prixPrestation + supplementActif;
  const acompteEstime = totalEstime / 2;

  // Index : Map<dateStr, DisponibiliteSpecifique[]> — toutes les plages actives du jour
  const dispoMap = useMemo(() => {
    const m = new Map<string, DisponibiliteSpecifique[]>();
    dispos.forEach((d) => {
      if (!d.actif) return;
      const arr = m.get(d.date_jour) || [];
      arr.push(d);
      m.set(d.date_jour, arr);
    });
    return m;
  }, [dispos]);

  const isDateBaseAvailable = useCallback(
    (date: Date) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (date < today) return false;
      if (isSameDay(date, today)) return false;
      const ds = dateToStr(date);
      if (isDateInIndispo(ds, indispos)) return false;
      const plages = dispoMap.get(ds);
      return !!(plages && plages.length > 0);
    },
    [dispoMap, indispos]
  );

  const slots = useMemo(() => {
    if (!selectedDate || !prestation) return [];
    const ds = dateToStr(selectedDate);
    return generateSlots({
      dateStr: ds,
      dispos: dispoMap.get(ds) || [],
      dureeMinutes: prestation.duree_minutes,
      battementMinutes: battement,
      indispos,
      bookedSlots: reservations,
    });
  }, [selectedDate, prestation, dispoMap, reservations, battement, indispos]);

  // Reset slot when date or prestation changes
  useEffect(() => {
    setSelectedSlot("");
  }, [selectedDate, selectedPrestation]);

  // Reset date when prestation changes
  useEffect(() => {
    setSelectedDate(null);
  }, [selectedPrestation]);

  // Calendar grid
  const calDays = useMemo(() => {
    const year = calMonth.getFullYear();
    const month = calMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startOffset = (firstDay.getDay() + 6) % 7;
    const days: (Date | null)[] = [];
    for (let i = 0; i < startOffset; i++) days.push(null);
    for (let d = 1; d <= lastDay.getDate(); d++) days.push(new Date(year, month, d));
    return days;
  }, [calMonth]);

  const fullyBookedDates = useMemo(() => {
    if (!prestation) return new Set<string>();
    const booked = new Set<string>();
    for (const day of calDays) {
      if (!day) continue;
      if (!isDateBaseAvailable(day)) continue;
      const ds = dateToStr(day);
      const slotsForDay = generateSlots({
        dateStr: ds,
        dispos: dispoMap.get(ds) || [],
        dureeMinutes: prestation.duree_minutes,
        battementMinutes: battement,
        indispos,
        bookedSlots: reservations,
      });
      if (slotsForDay.length === 0) booked.add(ds);
    }
    return booked;
  }, [prestation, calDays, isDateBaseAvailable, dispoMap, reservations, battement, indispos]);

  const isDateAvailable = useCallback(
    (date: Date) => {
      if (!isDateBaseAvailable(date)) return false;
      if (fullyBookedDates.has(dateToStr(date))) return false;
      return true;
    },
    [isDateBaseAvailable, fullyBookedDates]
  );

  // --- Submit ---
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
      if (!res.ok) throw new Error(data.error || "Erreur");

      setBookingResult({
        reservation_id: data.reservation_id,
        montant_total: data.montant_total,
        montant_acompte: data.montant_acompte,
        prestation_prix: data.prestation_prix,
        supplement: data.supplement,
      });
      setStatus("success");
      setDirection(1);
      setStep(3);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Une erreur est survenue.");
      setStatus("error");
    } finally {
      submittingRef.current = false;
      setIsSubmitting(false);
    }
  }

  function copyIban() {
    navigator.clipboard.writeText("FR7629833000010000035775278");
    setIbanCopied(true);
    setTimeout(() => setIbanCopied(false), 2000);
  }

  const shortId = bookingResult?.reservation_id?.slice(0, 8).toUpperCase() || "";
  const today = new Date();
  const canGoPrev =
    calMonth.getFullYear() > today.getFullYear() ||
    (calMonth.getFullYear() === today.getFullYear() && calMonth.getMonth() > today.getMonth());

  // --- Validation par étape ---
  const canNext: Record<StepIdx, boolean> = {
    0: !!selectedPrestation,
    1: !!selectedDate && !!selectedSlot,
    2: !!(prenom && nom && email && telephone && cgvAccepted),
    3: true,
  };

  /* ─── RENDU ────────────────────────────────────────── */
  return (
    <div ref={formTopRef}>
      <Stepper step={step} />

      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={step}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          {/* ÉTAPE 1 — Choix du soin */}
          {step === 0 && (
            <div>
              <h3 className="font-display text-2xl text-bordeaux-900">
                Choisissez votre soin
              </h3>
              <p className="mt-1 text-sm text-bordeaux-900/60">
                Sélectionnez la prestation qui vous fait envie.
              </p>

              <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {prestations.map((p) => {
                  const selected = selectedPrestation === p.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setSelectedPrestation(p.id)}
                      className={`group relative flex flex-col items-start rounded-2xl border-2 p-5 text-left transition-all ${
                        selected
                          ? "border-or-500 bg-or-50/60 shadow-md shadow-or-500/15"
                          : "border-bordeaux-100 bg-white hover:border-or-300 hover:bg-or-50/30"
                      }`}
                      aria-pressed={selected}
                    >
                      {selected && (
                        <span className="absolute right-3 top-3 grid h-7 w-7 place-items-center rounded-full bg-or-500 text-bordeaux-950">
                          <Check size={14} />
                        </span>
                      )}
                      <span className="text-[10px] uppercase tracking-[0.18em] text-bordeaux-600">
                        {p.categorie}
                      </span>
                      <h4 className="mt-1.5 font-display text-base text-bordeaux-900 sm:text-lg">
                        {p.nom}
                      </h4>
                      <div className="mt-2 flex items-center gap-3 text-xs text-bordeaux-900/70">
                        <span className="flex items-center gap-1">
                          <Clock size={12} /> {p.duree_minutes} min
                        </span>
                        <span aria-hidden className="h-3 w-px bg-bordeaux-200" />
                        <span className="font-semibold text-bordeaux-900">{p.prix} €</span>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  type="button"
                  disabled={!canNext[0]}
                  onClick={() => goTo(1)}
                  className="inline-flex items-center gap-2 rounded-full bg-or-500 px-6 py-3 text-sm font-semibold text-bordeaux-950 shadow-md transition-all hover:bg-or-400 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Suivant
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* ÉTAPE 2 — Date + créneau */}
          {step === 1 && prestation && (
            <div>
              <h3 className="font-display text-2xl text-bordeaux-900">
                Choisissez votre date et créneau
              </h3>
              <p className="mt-1 text-sm text-bordeaux-900/60">
                {prestation.nom} — {prestation.prix} € — {prestation.duree_minutes} min
              </p>

              {/* Calendrier */}
              <div className="mt-6 rounded-xl border border-bordeaux-200 bg-white p-4">
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

                <div className="mb-1 grid grid-cols-7 text-center text-xs font-medium text-bordeaux-900/50">
                  {JOUR_LABELS.map((j) => (
                    <div key={j} className="py-1">{j}</div>
                  ))}
                </div>

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
                              : "cursor-default text-gray-300"
                        }`}
                      >
                        {day.getDate()}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Créneaux */}
              {selectedDate && (
                <div className="mt-6">
                  <label className={labelClass}>
                    <Clock size={14} className="mr-1 inline" />
                    Créneau horaire
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
                          {formatTime(parseTimeStart(slot))}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className="mt-8 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => goTo(0)}
                  className="inline-flex items-center gap-2 rounded-full border-2 border-bordeaux-200 px-5 py-2.5 text-sm font-medium text-bordeaux-900 transition-colors hover:bg-bordeaux-50"
                >
                  <ArrowLeft size={16} />
                  Retour
                </button>
                <button
                  type="button"
                  disabled={!canNext[1]}
                  onClick={() => goTo(2)}
                  className="inline-flex items-center gap-2 rounded-full bg-or-500 px-6 py-3 text-sm font-semibold text-bordeaux-950 shadow-md transition-all hover:bg-or-400 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Suivant
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* ÉTAPE 3 — Vos infos */}
          {step === 2 && prestation && selectedDate && (
            <div>
              <h3 className="font-display text-2xl text-bordeaux-900">
                Vos informations
              </h3>
              <p className="mt-1 text-sm text-bordeaux-900/60">
                Pour confirmer votre rendez-vous.
              </p>

              <div className="mt-6 space-y-5">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className={labelClass}>Prénom <span className="text-or-700">*</span></label>
                    <input
                      type="text"
                      required
                      value={prenom}
                      onChange={(e) => setPrenom(e.target.value)}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Nom <span className="text-or-700">*</span></label>
                    <input
                      type="text"
                      required
                      value={nom}
                      onChange={(e) => setNom(e.target.value)}
                      className={inputClass}
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className={labelClass}>Téléphone <span className="text-or-700">*</span></label>
                    <input
                      type="tel"
                      required
                      value={telephone}
                      onChange={(e) => setTelephone(e.target.value)}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Email <span className="text-or-700">*</span></label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={inputClass}
                    />
                  </div>
                </div>

                <fieldset>
                  <legend className="mb-2 text-sm font-medium text-bordeaux-900">
                    Lieu <span className="text-or-700">*</span>
                  </legend>
                  <div className="grid grid-cols-2 gap-3">
                    <label className={`flex cursor-pointer items-center gap-2 rounded-lg border-2 p-3 text-sm transition-all ${lieu === "chez_naea" ? "border-or-500 bg-or-50" : "border-bordeaux-100 hover:border-or-300"}`}>
                      <input type="radio" name="location" value="chez_naea" checked={lieu === "chez_naea"} onChange={() => setLieu("chez_naea")} className="accent-or-500" />
                      Chez Naéa
                    </label>
                    <label className={`flex cursor-pointer items-center gap-2 rounded-lg border-2 p-3 text-sm transition-all ${lieu === "domicile" ? "border-or-500 bg-or-50" : "border-bordeaux-100 hover:border-or-300"}`}>
                      <input type="radio" name="location" value="domicile" checked={lieu === "domicile"} onChange={() => setLieu("domicile")} className="accent-or-500" />
                      À mon domicile
                    </label>
                  </div>
                </fieldset>

                {prestation && (
                  <div className="rounded-lg border border-or-200 bg-or-50/50 px-4 py-3">
                    <dl className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <dt className="text-bordeaux-900/70">Prestation : {prestation.nom}</dt>
                        <dd className="text-bordeaux-900">{formatPrice(prixPrestation)}</dd>
                      </div>
                      {supplementActif > 0 && (
                        <div className="flex justify-between">
                          <dt className="text-bordeaux-900/70">Supplément domicile</dt>
                          <dd className="text-bordeaux-900">+ {formatPrice(supplementActif)}</dd>
                        </div>
                      )}
                      <div className="flex justify-between border-t border-or-200 pt-1">
                        <dt className="font-medium text-bordeaux-900">Total</dt>
                        <dd className="font-medium text-bordeaux-900">{formatPrice(totalEstime)}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-bordeaux-900/70">Acompte (50%)</dt>
                        <dd className="font-semibold text-or-700">{formatPrice(acompteEstime)}</dd>
                      </div>
                    </dl>
                  </div>
                )}

                <div>
                  <label className={labelClass}>Message (optionnel)</label>
                  <textarea
                    rows={3}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Vos précisions, questions, attentes..."
                    className={`${inputClass} resize-none`}
                  />
                </div>

                <label className="flex cursor-pointer items-start gap-2.5">
                  <input
                    type="checkbox"
                    checked={cgvAccepted}
                    onChange={(e) => setCgvAccepted(e.target.checked)}
                    className="mt-0.5 shrink-0 accent-or-500"
                  />
                  <span className="text-xs leading-relaxed text-bordeaux-900/70">
                    J&apos;accepte les{" "}
                    <a href="/cgv" target="_blank" className="font-medium text-or-700 underline underline-offset-2 hover:text-or-900">
                      conditions de réservation
                    </a>{" "}
                    et la politique d&apos;acompte non-remboursable (50%).
                  </span>
                </label>
              </div>

              <div className="mt-8 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => goTo(1)}
                  className="inline-flex items-center gap-2 rounded-full border-2 border-bordeaux-200 px-5 py-2.5 text-sm font-medium text-bordeaux-900 transition-colors hover:bg-bordeaux-50"
                >
                  <ArrowLeft size={16} />
                  Retour
                </button>
                <button
                  type="button"
                  disabled={!canNext[2] || isSubmitting || status === "loading"}
                  onClick={handleSubmit}
                  className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-or-500 px-7 py-3 text-sm font-semibold text-bordeaux-950 shadow-md transition-all hover:bg-or-400 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <span className="pointer-events-none absolute inset-0 animate-shimmer-gold bg-gradient-to-r from-transparent via-white/40 to-transparent" />
                  <Calendar size={16} className="relative z-10" />
                  <span className="relative z-10">
                    {status === "loading" ? "Envoi..." : "Confirmer"}
                  </span>
                </button>
              </div>

              {status === "error" && (
                <p className="mt-4 text-center text-sm text-red-700">
                  {errorMsg}
                </p>
              )}
            </div>
          )}

          {/* ÉTAPE 4 — Récapitulatif + paiement */}
          {step === 3 && bookingResult && prestation && selectedDate && (
            <div className="space-y-6">
              <motion.div
                initial={{ scale: 0, rotate: -20 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 200, damping: 12 }}
                className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-or-100"
              >
                <Sparkles className="text-or-700" size={32} />
              </motion.div>
              <div className="text-center">
                <h3 className="font-display text-2xl text-bordeaux-900">
                  Réservation enregistrée !
                </h3>
                <p className="mt-2 text-sm text-bordeaux-900/70">
                  Pour confirmer, versez l&apos;acompte de{" "}
                  <strong>{formatPrice(bookingResult.montant_acompte)}</strong>
                </p>
              </div>

              {/* Récap */}
              <div className="rounded-lg border border-or-200 bg-or-50/50 px-5 py-4">
                <p className="text-sm font-semibold text-bordeaux-900">Récapitulatif</p>
                <dl className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm">
                  <dt className="text-bordeaux-900/60">Prestation</dt>
                  <dd className="text-bordeaux-900">{prestation.nom}</dd>
                  <dt className="text-bordeaux-900/60">Date</dt>
                  <dd className="text-bordeaux-900">
                    {selectedDate.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}{" "}
                    à {formatTime(parseTimeStart(selectedSlot))}
                  </dd>
                  <dt className="text-bordeaux-900/60">Lieu</dt>
                  <dd className="text-bordeaux-900">{lieu === "chez_naea" ? "Chez Naéa" : "À domicile"}</dd>
                  {bookingResult.supplement && bookingResult.supplement > 0 ? (
                    <>
                      <dt className="text-bordeaux-900/60">Prestation</dt>
                      <dd className="text-bordeaux-900">{formatPrice(bookingResult.prestation_prix ?? bookingResult.montant_total - bookingResult.supplement)}</dd>
                      <dt className="text-bordeaux-900/60">Supplément domicile</dt>
                      <dd className="text-bordeaux-900">+ {formatPrice(bookingResult.supplement)}</dd>
                    </>
                  ) : null}
                  <dt className="text-bordeaux-900/60">Montant total</dt>
                  <dd className="text-bordeaux-900">{formatPrice(bookingResult.montant_total)}</dd>
                  <dt className="text-bordeaux-900/60">Acompte (50%)</dt>
                  <dd className="font-semibold text-bordeaux-900">{formatPrice(bookingResult.montant_acompte)}</dd>
                </dl>
              </div>

              {/* Paiement */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl border border-bordeaux-100 bg-white p-5">
                  <h4 className="text-sm font-semibold text-bordeaux-900">PayPal</h4>
                  <a
                    href={`https://paypal.me/NAEABEAUTY/${bookingResult.montant_acompte.toFixed(2)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 flex w-full items-center justify-center gap-2 rounded-full bg-or-500 px-6 py-3 text-sm font-semibold text-bordeaux-950 shadow-md transition-all hover:shadow-lg hover:shadow-or-500/30"
                  >
                    <CreditCard size={16} />
                    Payer par PayPal
                  </a>
                  <p className="mt-3 text-xs text-bordeaux-900/60">
                    Envoyez {formatPrice(bookingResult.montant_acompte)} et indiquez votre nom en message
                  </p>
                </div>
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
                        <p className="mt-1"><span className="text-bordeaux-900/60">IBAN :</span> <strong className="font-mono">FR76 2983 3000 0100 0003 5775 278</strong></p>
                        <p className="mt-1"><span className="text-bordeaux-900/60">Montant :</span> <strong>{formatPrice(bookingResult.montant_acompte)}</strong></p>
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

              <p className="text-center text-xs text-bordeaux-900/60">
                Vous recevrez un email de confirmation dès que votre acompte est vérifié.
              </p>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
